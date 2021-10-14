import type { MenuDataItem, Settings as LayoutSettings } from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
import { notification } from 'antd';
import type { RequestConfig, RunTimeLayoutConfig } from 'umi';
import { history } from 'umi';
import RightContent from '@/components/RightContent';
import Footer from '@/components/Footer';
import { currentUser as queryCurrentUser } from './services/login/login';
import {
  BankOutlined,
  ContactsOutlined,
  SettingOutlined,
  SmileOutlined,
} from '@ant-design/icons/lib';
import Utils from '@/utils';
import { queryResource } from '@/services/core';
import { stringify } from 'querystring';
import { routes } from '../config/routes';

const loginPath = '/user/login';

const IconMap = {
  smile: <SmileOutlined />,
  contacts: <ContactsOutlined />,
  setting: <SettingOutlined />,
  bank: <BankOutlined />,
};

const loopMenuItem = (menus: MenuDataItem[]): MenuDataItem[] =>
  menus.map(({ icon, children, ...item }) => ({
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
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
  resource: API.Resource;
}> {
  const settings: Partial<LayoutSettings> = {};
  const resource: API.Resource = { fullName: '', fullPath: '', id: 0, name: '', type: 'group' };
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser();
      return msg.data;
    } catch (e) {
      return undefined
    }
  };

  const currentUser = await fetchUserInfo();
  if (currentUser?.id && history.location.pathname.startsWith(loginPath)) {
    history.replace('/');
  }

  // 资源类型的URL
  if (!pathnameInStaticRoutes()) {
    const path = Utils.getResourcePath();
    queryResource(path)
      .then(({ data }) => {
        const { type, id, name, fullPath, fullName } = data;
        resource.id = id;
        resource.name = name;
        resource.type = type;
        resource.fullName = fullName;
        resource.fullPath = fullPath;
      })
      .catch(() => {
        // don't show the menu
        settings.menuRender = false;
      });
  }

  return {
    currentUser,
    settings,
    resource,
  };
}

export const request: RequestConfig = {
  responseInterceptors: [
    (response) => {
      if (response.headers.get('X-OIDC-Redirect-To')) {
        history.push({
          pathname: loginPath,
          search: stringify({
            redirect: history.location.pathname + history.location.search,
          }),
        });
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
    const { response, data } = error;
    if (!response) {
      notification.error({
        description: '您的网络发生异常，无法连接服务器',
        message: '网络异常',
      });
    }
    if (data.errorCode || data.errorMessage) {
      notification.error({
        description: data.errorMessage,
        message: data.errorCode,
      });
    } else {
      notification.error({
        description: response.statusText,
        message: response.status,
      });
    }
    throw error;
  },
};

// ProLayout 支持的api https://procomponents.ant.design/components/layout
// @ts-ignore
export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  return {
    rightContentRender: () => <RightContent />,
    footerRender: () => <Footer />,
    onPageChange: () => {},
    menuHeaderRender: () => {
      const { name: title, fullPath } = initialState?.resource || {};
      if (!title || !fullPath) {
        return false;
      }
      const firstLetter = title.substring(0, 1).toUpperCase();
      return (
        <span
          style={{ alignItems: 'center', lineHeight: '40px' }}
          onClick={() => {
            window.location.href = fullPath;
          }}
        >
          <span className={`avatar-40 identicon bg${Utils.getAvatarColorIndex(title)}`}>
            {firstLetter}
          </span>
          <span style={{ alignItems: 'center', marginLeft: 60, color: 'black', fontSize: '16px' }}>
            {title}
          </span>
        </span>
      );
    },
    menu: {
      // 每当 initialState?.currentUser?.userid 发生修改时重新执行 request
      params: {
        resource: initialState?.resource
      },
      request: async (params, defaultMenuData) => {
        if (pathnameInStaticRoutes() || !initialState) {
          return defaultMenuData;
        }

        // 根据ResourceType决定菜单
        const { type, fullPath } = initialState.resource;
        switch (type) {
          case 'group':
            return loopMenuItem(formatGroupMenu(fullPath));
          case 'application':
            return loopMenuItem(formatApplicationMenu(fullPath));
          default:
            return defaultMenuData;
        }
      },
    },
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    ...initialState?.settings,
  };
};

function pathnameInStaticRoutes(): boolean {
  const {pathname} = history.location;
  // handle url end with '/'
  let path = pathname;
  if (pathname.endsWith('/')) {
    path = pathname.substring(0, pathname.length - 1);
  }
  if (path === '') {
    return true;
  }

  for (let i = 0; i < routes.length; i += 1) {
    const staticRoute = routes[i];
    if (path === staticRoute.path) {
      return true;
    }
  }

  return false;
}

function formatGroupMenu(fullPath: string) {
  return [
    ...routes,
    {
      name: 'Group overview',
      icon: 'bank',
      children: [
        {
          path: `${fullPath}`,
          name: 'Details',
        },
      ],
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
          path: `/groups${fullPath}/-/edit`,
          name: 'General',
        },
      ],
    },
  ];
}

function formatApplicationMenu(fullPath: string) {
  return [
    ...routes,
    {
      name: 'Service overview',
      icon: 'bank',
      children: [
        {
          path: `${fullPath}`,
          name: 'Details',
        },
      ],
    },
    {
      path: `/applications${fullPath}/-/service_instances`,
      name: 'Service instances',
      icon: 'appstore',
    },
    {
      path: `/applications${fullPath}/-/members`,
      name: 'Members',
      icon: 'contacts',
    },
  ];
}
