import type {MenuDataItem, Settings as LayoutSettings} from '@ant-design/pro-layout';
import {PageLoading} from '@ant-design/pro-layout';
import {Menu, notification, Tooltip} from 'antd';
import type {RequestConfig, RunTimeLayoutConfig} from 'umi';
import {history} from 'umi';
import RBAC from '@/rbac';
import RightContent from '@/components/RightContent';
import Footer from '@/components/Footer';
import {currentUser as queryCurrentUser} from './services/login/login';
import {
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
  TagsOutlined
} from '@ant-design/icons/lib';
import Utils, {pathnameInStaticRoutes} from '@/utils';
import {queryResource} from '@/services/core';
import {stringify} from 'querystring';
import {routes} from '../config/routes';
import {ResourceType} from '@/const'
import {queryRoles, querySelfMember} from "@/services/members/members";
import type {API} from './services/typings';

const loginPath = '/user/login';
const queryUserPath = '/apis/login/v1/status';
const sessionExpireHeaderKey = 'X-OIDC-Redirect-To';
const {SubMenu} = Menu;

const IconMap = {
  smile: <SmileOutlined/>,
  contacts: <ContactsOutlined/>,
  setting: <SettingOutlined/>,
  bank: <BankOutlined/>,
  appstore: <AppstoreOutlined/>,
  fundout: <FundOutlined/>,
  tags: <TagsOutlined/>,
  cluster: <ClusterOutlined/>,
  environment: <EnvironmentOutlined/>,
  database: <DatabaseOutlined/>,
  templates: <SnippetsOutlined/>,
  edit: <EditOutlined />
};

const loopMenuItem = (menus: MenuDataItem[]): MenuDataItem[] =>
  menus.map(({icon, children, ...item}) => ({
    ...item,
    icon: icon && IconMap[icon as string],
    children: children && loopMenuItem(children),
  }));

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading/>,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  roles?: API.Role[];
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
  resource: API.Resource;
  accordionCollapse: boolean;
}> {
  const settings: Partial<LayoutSettings> = {};
  const resource: API.Resource = {
    fullName: '',
    fullPath: '',
    id: 0,
    name: '',
    type: 'group',
    parentID: 0,
  };
  let currentUser: API.CurrentUser | undefined = {
    id: 0,
    name: "",
    isAdmin: false,
    role: RBAC.AnonymousRole,
  }
  let roles: API.Role[] = [];

  try {
    const {data: userData} = await queryCurrentUser();

    if (userData?.id && history.location.pathname.startsWith(loginPath)) {
      history.replace('/');
    }

    currentUser.id = userData.id
    currentUser.name = userData.name
    currentUser.isAdmin = userData.isAdmin

    const {data: rolesData} = await queryRoles()
    roles = rolesData
  } catch (e) {
    currentUser = undefined
  }

  // 资源类型的URL
  if (!pathnameInStaticRoutes()) {
    const path = Utils.getResourcePath();
    try {
      const isReleasePath = /\/templates(.*)\/-\/releases\/.*?(?:\/edit)?\/?/
      const pathArr = isReleasePath.exec(history.location.pathname)
      console.log(pathArr)
      const isRelease = pathArr != null
      const {data: resourceData} = history.location.pathname.startsWith('/templates')?
       isRelease ? await queryResource(path,"templatereleases") : 
        await queryResource(path,"templates") : 
        await queryResource(path,"");

      resource.id = resourceData.id;
      resource.name = resourceData.name;
      resource.type = resourceData.type;
      resource.fullName = resourceData.fullName;
      resource.fullPath = resourceData.fullPath;
      resource.parentID = resourceData.parentID;

      let memberData =  null;
      
      if(isRelease) {
        const {data: template} = await queryResource(pathArr[1],"templates");
        ({data: memberData} = await querySelfMember("template", template.id))
      }else{
        ({data: memberData} = await querySelfMember(resource.type, resource.id))
      }
      if (memberData.total > 0) {
        currentUser!.role = memberData.items[0].role;
      } else {
        currentUser!.role = RBAC.AnonymousRole;
      }
      if (currentUser!.isAdmin) {
        currentUser!.role = RBAC.AdminRole
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
  requestInterceptors: [
    (url, options) => {
      return {
        url: url,
        options: {
          ...options, interceptors: true, headers: {
            ...options.headers,
            "X-HORIZON-OIDC-EMAIL": "wurongjun@corp.netease.com",
            "X-HORIZON-OIDC-FULLNAME": "wrj",
            "X-HORIZON-OIDC-TYPE": "netease",
            "X-HORIZON-OIDC-USER": "wrj"
          }
        },
      };
    },
  ],
  responseInterceptors: [
    (response) => {
      // 我们认为只有查询用户接口的响应带上了session过期的头，才跳转到登陆页
      if (response.headers.get(sessionExpireHeaderKey) && response.url.endsWith(queryUserPath)) {
        history.push({
          pathname: loginPath,
          search: stringify({
            redirect: history.location.pathname + history.location.search,
          }),
        });
        return response
      }
      // 其他接口请求（在非登陆页面下），如果响应里有session过期的头，调一次查询用户接口，进行一次二次确认
      if (response.headers.get(sessionExpireHeaderKey) && !history.location.pathname.startsWith(loginPath)) {
        // double check session
        queryCurrentUser()
      }
      return response;
    },
  ],
  errorConfig: {
    adaptor: (resData) => {
      return {
        ...resData,
        success: !resData.errorCode,
      };
    },
  },
  errorHandler: (error: any) => {
    const {response, data} = error;
    if (!response) {
      notification.error({
        message: '网络异常',
        description: '您的网络发生异常，无法连接服务器',
      });
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
export const layout: RunTimeLayoutConfig = ({initialState, setInitialState}) => {
  return {
    headerContentRender: () => {
      return <Menu mode="horizontal" theme={'dark'} style={{marginLeft: '10px', color: '#989898'}} selectable={false}>
        <Menu.Item key="1">
          <a style={{fontWeight: 'bold'}} onClick={() => history.push("/dashboard/clusters")}>Clusters</a>
        </Menu.Item>
        <Menu.Item key="2">
          <a style={{fontWeight: 'bold'}} onClick={() => history.push("/dashboard/applications")}>Applications</a>
        </Menu.Item>
        <Menu.Item key="3">
          <a style={{fontWeight: 'bold'}} onClick={() => history.push("/explore/groups")}>Groups</a>
        </Menu.Item>
        <Menu.Item key="7">
          <a style={{fontWeight: 'bold'}} onClick={() => history.push('/templates')}>Templates</a>
        </Menu.Item>
        <SubMenu key="4" title={<span style={{fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.65)'}}>
          More <DownOutlined style={{fontSize: 'x-small', color: 'rgba(255, 255, 255, 0.65)'}}/>
        </span>}>
          <Menu.Item key="5">
            <a style={{fontWeight: 'bold'}} href={'/slo'}>SLO</a>
          </Menu.Item>
          {
            initialState?.currentUser?.isAdmin && <Menu.Item key="6">
              <a style={{fontWeight: 'bold'}} href={'/admin'}>Admin</a>
            </Menu.Item>
          }
        </SubMenu>
      </Menu>
    },
    rightContentRender: () => <RightContent/>,
    footerRender: () => <Footer/>,
    onPageChange: () => {
      if (!initialState?.currentUser?.isAdmin && history.location.pathname.startsWith("/admin/")) {
        // @ts-ignore
        setInitialState((s) => ({...s, settings: {...s.settings, menuRender: false}}));
      }
    },
    menuHeaderRender: () => {
      const {name: t, fullPath: f} = initialState?.resource || {};
      const title = t || "admin";
      const fullPath = f || "/admin"

      const {accordionCollapse = false} = initialState || {};
      const firstLetter = title.substring(0, 1).toUpperCase();
      if (!accordionCollapse) {
        const titleContent = title.length <= 15 ? title : `${title.substr(0, 12)}...`
        return (
          <Tooltip title={title}>
            <span
              style={{alignItems: 'center', lineHeight: '40px'}}
              onClick={() => {
                window.location.href = fullPath;
              }}
            >
              <span className={`avatar-40 identicon bg${Utils.getAvatarColorIndex(title)}`}>
                {firstLetter}
              </span>
              <span style={{alignItems: 'center', marginLeft: 60, color: 'black', fontSize: '16px'}}>
                {titleContent}
              </span>
            </span>
          </Tooltip>
        );
      }

      return (
        <Tooltip title={title}>
          <span
            style={{alignItems: 'center', lineHeight: '40px'}}
            onClick={() => {
              window.location.href = fullPath;
            }}
          >
            <span className={`avatar-40 identicon bg${Utils.getAvatarColorIndex(title)}`}>
              {firstLetter}
            </span>
            <span style={{alignItems: 'center', marginLeft: 60, color: 'black', fontSize: '16px'}}/>
          </span>
        </Tooltip>
      );
    },
    menu: {
      // 每当 initialState?.currentUser?.userid 发生修改时重新执行 request
      params: {
        resource: initialState?.resource
      },
      request: async (params, defaultMenuData) => {
        if (history.location.pathname.startsWith("/admin/")) {
          return loopMenuItem([
            ...routes,
            {
              path: `/admin/harbors`,
              name: 'Harbors',
              icon: 'database',
            }, {
              path: `/admin/kubernetes`,
              name: 'Kubernetes',
              icon: 'cluster',
            }, {
              path: `/admin/environments`,
              name: 'Environments',
              icon: 'environment',
            },
            {
              path: `/admin/templates`,
              name: 'Templates',
              icon: "templates",
            }
          ]);
        }

        if (pathnameInStaticRoutes() || !initialState) {
          return defaultMenuData;
        }

        // 根据ResourceType决定菜单
        const {type, fullPath} = initialState.resource;
        switch (type) {
          case ResourceType.GROUP:
            return loopMenuItem(formatGroupMenu(fullPath));
          case ResourceType.APPLICATION:
            return loopMenuItem(formatApplicationMenu(fullPath));
          case ResourceType.CLUSTER:
            return loopMenuItem(formatClusterMenu(fullPath));
          case ResourceType.TEMPLATE:
            return loopMenuItem(formatTemplateMenu(fullPath));
          case ResourceType.RELEASE:
            return loopMenuItem(formatReleaseMenu(fullPath))
          default:
            return defaultMenuData;
        }
      },
    },
    onCollapse: (collapsed) => {
      // @ts-ignore
      setInitialState((s) => ({...s, accordionCollapse: collapsed}));
    },
    ...initialState?.settings,
    logo: <div/>
  };
};

function formatTemplateMenu(fullPath: string): MenuDataItem[] {
  return [
    ...routes,
    {
      name: 'Template detail',
      icon: 'templates',
      path: `/templates${fullPath}/-/detail`
    },
    {
      name: 'Members',
      icon: 'contacts',
      path: `/templates${fullPath}/-/members`,
    },
  ]
}

function formatReleaseMenu(fullPath: string): MenuDataItem[] {
  return [
    ...routes,
    {
      name: 'Release detail',
      icon: 'templates',
      path: `/releases${fullPath}/-/detail`
    },
    {
      name: 'Release edit',
      path: `/releases${fullPath}/-/edit`,
      icon: 'edit',
    }
  ]
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
          name: '开发者设置'
        },
        {
          path: `/groups${fullPath}/-/settings/oauthapps/:id`,
          parentKeys: [`/groups${fullPath}/-/settings/oauthapps`],
        },
      ],
    },
    {
      path: `/groups${fullPath}/-/newsubgroup`,
      menuRender: false,
    },
    {
      path: `/groups${fullPath}/-/newapplication`,
      menuRender: false,
    },
    {
      path: `/groups${fullPath}/-/newoauthapp`,
      menuRender: false,
    },
    {
      name: 'Templates',
      path: `/groups${fullPath}/-/templates`,
      icon: 'templates',
    }
  ];
}

function formatApplicationMenu(fullPath: string) {
  return [
    ...routes,
    {
      name: 'Application overview',
      icon: 'bank',
      path: `${fullPath}`,
    },
    {
      path: `/applications${fullPath}/-/clusters`,
      name: 'Clusters',
      icon: 'appstore',
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
      path: `/applications${fullPath}/-/clusters/new`,
      menuRender: false,
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
      ],
    },
  ];
}

function formatClusterMenu(fullPath: string) {
  return [
    ...routes,
    {
      name: 'Cluster overview',
      icon: 'bank',
      path: `${fullPath}`,
    },
    {
      path: `/clusters${fullPath}/-/pods`,
      name: 'Pods',
      icon: 'appstore',
    },
    {
      path: `/clusters${fullPath}/-/edit`,
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
      icon: 'fundout'
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
  ];
}
