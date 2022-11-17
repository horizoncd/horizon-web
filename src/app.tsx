/* eslint-disable */
import type { MenuDataItem, Settings as LayoutSettings } from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
import { Menu, notification, Tooltip } from 'antd';
import type { RequestConfig, RunTimeLayoutConfig } from 'umi';
import { history } from 'umi';
import {
  ApiOutlined,
  AppstoreOutlined,
  BankOutlined,
  ClusterOutlined,
  ContactsOutlined,
  DatabaseOutlined,
  DownOutlined,
  EditOutlined,
  EnvironmentOutlined,
  FundOutlined,
  SettingOutlined,
  SmileOutlined,
  SnippetsOutlined,
  TagsOutlined,
  UserOutlined,
  ProfileOutlined,
  KeyOutlined
} from '@ant-design/icons/lib';
import { stringify } from 'querystring';
import RBAC from '@/rbac';
import RightContent from '@/components/RightContent';
import Footer from '@/components/Footer';
import { currentUser as queryCurrentUser } from './services/login/login';
import Utils, { pathnameInStaticRoutes } from '@/utils';
import { queryResource } from '@/services/core';
import { routes } from '../config/routes';
import { ResourceType } from '@/const';
import { queryRoles, querySelfMember } from '@/services/members/members';
import type { API } from './services/typings';

const loginPath = '/user/login';
const callbackPath = '/user/login/callback';
const sessionExpireHeaderKey = 'X-OIDC-Redirect-To';
const { SubMenu } = Menu;

const IconMap = {
  smile: <SmileOutlined />,
  contacts: <ContactsOutlined />,
  setting: <SettingOutlined />,
  bank: <BankOutlined />,
  appstore: <AppstoreOutlined />,
  fundout: <FundOutlined />,
  tags: <TagsOutlined />,
  cluster: <ClusterOutlined />,
  environment: <EnvironmentOutlined />,
  database: <DatabaseOutlined />,
  templates: <SnippetsOutlined />,
  edit: <EditOutlined />,
  idp: <ApiOutlined />,
  user: <UserOutlined />,
  profile: <ProfileOutlined />,
  accessToken: <KeyOutlined />
};

const loopMenuItem = (menus: MenuDataItem[]): MenuDataItem[] => menus.map(({ icon, children, ...item }) => ({
  ...item,
  icon: icon && IconMap[icon as string],
  children: children && loopMenuItem(children),
}));

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<API.InitialState> {
  const settings: Partial<LayoutSettings> = {};
  const resource: API.Resource = {
    fullName: '',
    fullPath: '',
    id: 0,
    name: '',
    type: 'group',
    parentID: 0,
  };

  if (history.location.pathname === loginPath
    || history.location.pathname === callbackPath) {
    return { resource, accordionCollapse: false };
  }

  let currentUser: API.CurrentUser | undefined = {
    id: 0,
    name: '',
    fullName: '',
    isAdmin: false,
    role: RBAC.AnonymousRole,
  };
  let roles: API.Role[] = [];

  try {
    const { data: userData } = await queryCurrentUser();

    if (userData?.id && history.location.pathname.startsWith(loginPath)) {
      history.replace('/');
    }

    currentUser.id = userData.id;
    currentUser.name = userData.name;
    currentUser.fullName = userData.fullName
    currentUser.isAdmin = userData.isAdmin;

    const { data: rolesData } = await queryRoles();
    roles = rolesData;
  } catch (e) {
    currentUser = undefined;
  }

  // 资源类型的URL
  if (!pathnameInStaticRoutes()) {
    const path = Utils.getResourcePath();
    try {
      const isReleasePath = /\/templates(.*)\/-\/releases\/.*?(?:\/edit)?\/?/;
      const pathArr = isReleasePath.exec(history.location.pathname);
      const isRelease = pathArr != null;
      const { data: resourceData } = history.location.pathname.startsWith('/templates')
        ? isRelease ? await queryResource(path, 'templatereleases')
          : await queryResource(path, 'templates')
        : await queryResource(path, '');

      resource.id = resourceData.id;
      resource.name = resourceData.name;
      resource.type = resourceData.type;
      resource.fullName = resourceData.fullName;
      resource.fullPath = resourceData.fullPath;
      resource.parentID = resourceData.parentID;

      let memberData = null;

      if (isRelease) {
        const { data: template } = await queryResource(pathArr[1], 'templates');
        ({ data: memberData } = await querySelfMember('template', template.id));
      } else {
        ({ data: memberData } = await querySelfMember(resource.type, resource.id));
      }
      if (memberData.total > 0) {
        currentUser!.role = memberData.items[0].role;
      } else {
        currentUser!.role = RBAC.AnonymousRole;
      }
      if (currentUser!.isAdmin) {
        currentUser!.role = RBAC.AdminRole;
      }

      RBAC.RefreshPermissions(roles, currentUser!);
    } catch (e) {
      settings.menuRender = false;
    }
  }

  return {
    currentUser,
    roles,
    settings,
    resource,
    accordionCollapse: false,
  };
}

export const request: RequestConfig = {
  responseInterceptors: [
    (response) => {
      // 我们认为只有查询用户接口的响应带上了session过期的头，才跳转到登陆页
      if (response.headers.get(sessionExpireHeaderKey)) {
        let u = new URL(window.location.toString());

        const redirect = u.searchParams.get('redirect') ?? '';
        if (redirect === '') {
          u.searchParams.delete('redirect');
        } else {
          u = new URL(redirect);
        }

        history.push({
          pathname: loginPath,
          search: stringify({
            redirect: u.toString(),
          }),
        });
        return response;
      }
      return response;
    },
  ],
  errorConfig: {
    adaptor: (resData) => ({
      ...resData,
      success: !resData.errorCode,
    }),
  },
  errorHandler: (error: any) => {
    const { response, data } = error;
    if (!response) {
      notification.error({
        message: '网络异常',
        description: '您的网络发生异常，无法连接服务器',
      });
    }
    if (response.headers.get(sessionExpireHeaderKey)) {
      return
    }
    if (data.errorCode || data.errorMessage) {
      notification.error({
        message: data.errorCode,
        description: data.errorMessage,
      });
    } else {
      notification.error({
        message: response.status,
        description: response.statusText,
      });
    }
    throw error;
  },
};

// ProLayout 支持的api https://procomponents.ant.design/components/layout
// @ts-ignore
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => ({
  headerContentRender: () => (
    <Menu mode="horizontal" theme="dark" style={{ marginLeft: '10px', color: '#989898' }} selectable={false}>
      <Menu.Item key="1">
        <a style={{ fontWeight: 'bold' }} onClick={() => history.push('/dashboard/clusters')}>Clusters</a>
      </Menu.Item>
      <Menu.Item key="2">
        <a style={{ fontWeight: 'bold' }} onClick={() => history.push('/dashboard/applications')}>Applications</a>
      </Menu.Item>
      <Menu.Item key="3">
        <a style={{ fontWeight: 'bold' }} onClick={() => history.push('/explore/groups')}>Groups</a>
      </Menu.Item>
      <Menu.Item key="7">
        <a style={{ fontWeight: 'bold' }} onClick={() => history.push('/templates')}>Templates</a>
      </Menu.Item>
      <SubMenu
        key="4"
        title={(
          <span style={{ fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.65)' }}>
            More
            {' '}
            <DownOutlined style={{ fontSize: 'x-small', color: 'rgba(255, 255, 255, 0.65)' }} />
          </span>
        )}
      >
        <Menu.Item key="5">
          <a style={{ fontWeight: 'bold' }} href="/slo">SLO</a>
        </Menu.Item>
        {
          initialState?.currentUser?.isAdmin && (
            <Menu.Item key="6">
              <a style={{ fontWeight: 'bold' }} href="/admin">Admin</a>
            </Menu.Item>
          )
        }
      </SubMenu>
    </Menu>
  ),
  rightContentRender: () => <RightContent />,
  footerRender: () => <Footer />,
  onPageChange: () => {
    if (!initialState?.currentUser?.isAdmin && history.location.pathname.startsWith('/admin/')) {
      // @ts-ignore
      setInitialState((s) => ({ ...s, settings: { ...s.settings, menuRender: false } }));
    }
  },
  menuHeaderRender: () => {
    const { name: t, fullPath: f, type } = initialState?.resource || {};
    
    const title = t || (history.location.pathname.startsWith('/admin')? 'admin' : 'profile');
    const fullPath = f || (history.location.pathname.startsWith('/admin') ? '/admin' : '/profile/user');

    const { accordionCollapse = false } = initialState || {};
    const firstLetter = title.charAt(0).toUpperCase();
    if (!accordionCollapse) {
      const titleContent = title.length <= 15 ? title : `${title.substr(0, 12)}...`;
      return (
        <Tooltip title={title}>
          <span
            style={{ alignItems: 'center', lineHeight: '40px' }}
            onClick={() => {
              if (type === ResourceType.TEMPLATE) {
                window.location.href = `/templates${fullPath}/-/detail`;
              } else {
                window.location.href = fullPath;
              }
            }}
          >
            <span className={`avatar-40 identicon bg${Utils.getAvatarColorIndex(title)}`}>
              {firstLetter}
            </span>
            <span style={{
              alignItems: 'center', marginLeft: 60, color: 'black', fontSize: '16px',
            }}
            >
              {titleContent}
            </span>
          </span>
        </Tooltip>
      );
    }

    return (
      <Tooltip title={title}>
        <span
          style={{ alignItems: 'center', lineHeight: '40px' }}
          onClick={() => {
            if (type === ResourceType.TEMPLATE) {
              window.location.href = `/templates${fullPath}/-/detail`;
            } else {
              window.location.href = fullPath;
            }
          }}
        >
          <span className={`avatar-40 identicon bg${Utils.getAvatarColorIndex(title)}`}>
            {firstLetter}
          </span>
          <span style={{
            alignItems: 'center', marginLeft: 60, color: 'black', fontSize: '16px',
          }}
          />
        </span>
      </Tooltip>
    );
  },
  menu: {
    // 每当 initialState?.currentUser?.userid 发生修改时重新执行 request
    params: {
      resource: initialState?.resource,
    },
    request: async (params, defaultMenuData) => {
      if (history.location.pathname.startsWith('/admin/')) {
        return loopMenuItem([
          ...routes,
          {
            path: '/admin/registries',
            name: 'Registries',
            icon: 'database',
          }, {
            path: '/admin/kubernetes',
            name: 'Kubernetes',
            icon: 'cluster',
          }, {
            path: '/admin/environments',
            name: 'Environments',
            icon: 'environment',
          }, {
            path: '/admin/users',
            name: 'Users',
            icon: 'user',
          },
          {
            path: '/admin/idps',
            name: 'IDPs',
            icon: 'idp',
          },
        ]);
      }

      if (history.location.pathname.startsWith('/profile')) {
        return loopMenuItem([
          ...routes,
          {
            path: '/profile/user',
            name: 'Profile',
            icon: 'user',
          },
          {
            path: '/profile/personalaccesstoken',
            name: 'Personal Access Token',
            icon: 'accessToken',
          }
        ])
      }

      if (pathnameInStaticRoutes() || !initialState) {
        return defaultMenuData;
      }

      // 根据ResourceType决定菜单
      const { type, fullPath } = initialState.resource;
      switch (type) {
        case ResourceType.GROUP:
          return loopMenuItem(formatGroupMenu(fullPath));
        case ResourceType.APPLICATION:
          return loopMenuItem(formatApplicationMenu(fullPath));
        case ResourceType.CLUSTER:
          return loopMenuItem(formatClusterMenu(fullPath));
        case ResourceType.TEMPLATE:
          return loopMenuItem(formatTemplateMenu(fullPath));
        default:
          return defaultMenuData;
      }
    },
  },
  onCollapse: (collapsed) => {
    // @ts-ignore
    setInitialState((s) => ({ ...s, accordionCollapse: collapsed }));
  },
  ...initialState?.settings,
  logo: <div />,
});

function formatTemplateMenu(fullPath: string): MenuDataItem[] {
  return [
    ...routes,
    {
      name: '模板详细信息',
      icon: 'templates',
      path: `/templates${fullPath}/-/detail`,
    },
    {
      path: `/templates${fullPath}/-/detail`,
    },
    {
      path: `/templates${fullPath}/-/newrelease`,
    },
    {
      path: `/templates${fullPath}/-/edit`,
    },
    {
      name: 'Members',
      icon: 'contacts',
      path: `/templates${fullPath}/-/members`,
    },
  ];
}

function formatGroupMenu(fullPath: string) {
  return [
    ...routes,
    {
      name: 'Group overview',
      icon: 'bank',
      path: `${fullPath}`,
    },
    {
      path: `/groups${fullPath}/-/members`,
      name: 'Members',
      icon: 'contacts',
    },
    {
      path: `/groups${fullPath}/-/settings`,
      name: 'Settings',
      icon: 'setting',
      children: [
        {
          path: `/groups${fullPath}/-/settings/basic`,
          name: 'General',
        },
        {
          path: `/groups${fullPath}/-/settings/advance`,
          name: 'Advance',
        },
        {
          path: `/groups${fullPath}/-/settings/oauthapps`,
          name: '开发者设置',
        },
        {
          path: `/groups${fullPath}/-/settings/oauthapps/:id`,
          parentKeys: [`/groups${fullPath}/-/settings/oauthapps`],
        },
        {
          path: `/groups${fullPath}/-/settings/accesstokens`,
          name: 'Access Token',
        },
      ],
    },
    {
      path: `/groups${fullPath}/-/newsubgroup`,
      menuRender: false,
    },
    {
      path: `/groups${fullPath}/-/newapplication:q:`,
      menuRender: false,
    },
    {
      path: `/groups${fullPath}/-/newapplicationv1`,
      menuRender: false,
    },
    {
      path: `/groups${fullPath}/-/newoauthapp`,
      menuRender: false,
    },
    {
      path: `/groups${fullPath}/-/newapplicationv2`,
      menuRender: false,
    },
    {
      name: 'Templates',
      path: `/groups${fullPath}/-/templates`,
      icon: 'templates',
    },
  ];
}

function formatApplicationMenu(fullPath: string) {
  return [
    ...routes,
    {
      path: `${fullPath}`,
      name: 'Clusters',
      icon: 'appstore',
    },
    {
      name: 'Application configs',
      icon: 'bank',
      path: `/applications${fullPath}/-/configs`,
    },
    {
      path: `/applications${fullPath}/-/members`,
      name: 'Members',
      icon: 'contacts',
    },
    {
      path: `/applications${fullPath}/-/edit`,
      menuRender: false,
    },
    {
      path: `/applications${fullPath}/-/editv2`,
      menuRender: false,
    },
    {
      path: `/applications${fullPath}/-/newcluster`,
      menuRender: false,
    },
    {
      path: `/applications${fullPath}/-/newclusterv2`,
      menuRender: false,
    },
    {
      path: `/applications${fullPath}/-/stats`,
      name: 'Stats',
      icon: 'profile',
      children: [
        {
          path: `/applications${fullPath}/-/stats/pipeline`,
          name: 'Pipeline',
        },
      ],
    },
    {
      path: `/applications${fullPath}/-/settings`,
      name: 'Settings',
      icon: 'setting',
      children: [
        {
          path: `/applications${fullPath}/-/settings/advance`,
          name: 'Advance',
        },
        {
          path: `/applications${fullPath}/-/settings/accesstokens`,
          name: 'Access Token',
        },
      ],
    },
  ];
}

function formatClusterMenu(fullPath: string) {
  return [
    ...routes,
    {
      path: `${fullPath}`,
      name: 'Pods',
      icon: 'appstore',
    },
    {
      name: 'Cluster configs',
      icon: 'bank',
      path: `/clusters${fullPath}/-/configs`,
    },
    {
      path: `/clusters${fullPath}/-/edit`,
      menuRender: false,
    },
    {
      path: `/clusters${fullPath}/-/editv2`,
      menuRender: false,
    },
    {
      path: `/clusters${fullPath}/-/pipelines`,
      name: 'Pipelines',
      icon: 'tags',
    },
    {
      path: `/clusters${fullPath}/-/pipelines/new`,
      parentKeys: [`/clusters${fullPath}/-/pipelines`],
    },
    {
      path: `/clusters${fullPath}/-/pipelines/:id`,
      parentKeys: [`/clusters${fullPath}/-/pipelines`],
    },
    {
      path: `/clusters${fullPath}/-/monitoring`,
      name: 'Monitoring',
      icon: 'fundout',
    },
    {
      path: `/clusters${fullPath}/-/members`,
      name: 'Members',
      icon: 'contacts',
    },
    {
      path: `/clusters${fullPath}/-/webconsole`,
      menuRender: false,
      headerRender: false,
      menuHeaderRender: false,
      footerRender: false,
    },
    {
      path: `/clusters${fullPath}/-/settings`,
      name: 'Settings',
      icon: 'setting',
      children: [
        {
          path: `/clusters${fullPath}/-/settings/accesstokens`,
          name: 'Access Token',
        },
      ],
    },
  ];
}
