import type { MenuDataItem, Settings as LayoutSettings } from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
import { notification } from 'antd';
import type { RequestConfig, RunTimeLayoutConfig } from 'umi';
import {history, Link} from 'umi';
import RightContent from '@/components/RightContent';
import Footer from '@/components/Footer';
import { currentUser as queryCurrentUser } from './services/ant-design-pro/login';
import { stringify } from 'querystring';
import {
  BankOutlined,
  ContactsOutlined,
  SettingOutlined,
  SmileOutlined,
} from '@ant-design/icons/lib';
import Utils from "@/utils";

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
  pathname?: string;
}> {
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser();
      return msg.data;
    } catch (error) {
      history.push({
        pathname: loginPath,
        search: stringify({
          redirect: history.location.pathname + history.location.search,
        }),
      });
    }
    return undefined;
  };
  // 如果是登录页面，不执行
  if (history.location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: {},
      pathname: history.location.pathname,
    };
  }
  return {
    fetchUserInfo,
    settings: {},
  };
}

/**
 * 异常处理程序
 200: '服务器成功返回请求的数据。',
 201: '新建或修改数据成功。',
 202: '一个请求已经进入后台排队（异步任务）。',
 204: '删除数据成功。',
 400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
 401: '用户没有权限（令牌、用户名、密码错误）。',
 403: '用户得到授权，但是访问是被禁止的。',
 404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
 405: '请求方法不被允许。',
 406: '请求的格式不可得。',
 410: '请求的资源被永久删除，且不会再得到的。',
 422: '当创建一个对象时，发生一个验证错误。',
 500: '服务器发生错误，请检查服务器。',
 502: '网关错误。',
 503: '服务不可用，服务器暂时过载或维护。',
 504: '网关超时。',
 //-----English
 200: The server successfully returned the requested data. ',
 201: New or modified data is successful. ',
 202: A request has entered the background queue (asynchronous task). ',
 204: Data deleted successfully. ',
 400: 'There was an error in the request sent, and the server did not create or modify data. ',
 401: The user does not have permission (token, username, password error). ',
 403: The user is authorized, but access is forbidden. ',
 404: The request sent was for a record that did not exist. ',
 405: The request method is not allowed. ',
 406: The requested format is not available. ',
 410':
 'The requested resource is permanently deleted and will no longer be available. ',
 422: When creating an object, a validation error occurred. ',
 500: An error occurred on the server, please check the server. ',
 502: Gateway error. ',
 503: The service is unavailable. ',
 504: The gateway timed out. ',
 * @see https://beta-pro.ant.design/docs/request-cn
 */
export const request: RequestConfig = {
  errorConfig: {
    adaptor: (resData) => {
      return {
        ...resData,
        success: resData.code === 200,
        errorCode: resData.code,
        errorMessage: resData.message,
      };
    },
  },
  errorHandler: (error: any) => {
    const { response, data, name } = error;
    if (!response) {
      notification.error({
        description: '您的网络发生异常，无法连接服务器',
        message: '网络异常',
      });
    }
    if (name === 'BizError') {
      notification.error({
        description: data.message,
        message:  data.code,
      });
    } else {
      notification.error({
        description: response.statusText,
        message: response.status
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
    disableContentMargin: false,
    waterMarkProps: {},
    footerRender: () => <Footer />,
    onPageChange: () => {
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && history.location.pathname !== loginPath) {
        // 将当前URL作为查询参数
        history.push({
          pathname: loginPath,
          search: stringify({
            redirect: history.location.pathname + history.location.search,
          }),
        });
      }
    },
    menuHeaderRender: () => {
      const title = Utils.getResourceName(history.location.pathname);
      const path = Utils.getResourcePath(history.location.pathname);
      const firstLetter = title.substring(0, 1).toUpperCase()
      return <span style={{alignItems: 'center', lineHeight: '40px'}}>
      <span className={`avatar-40 identicon bg${Utils.getAvatarColorIndex(title)}`}>
        {firstLetter}
      </span>
      <Link style={{alignItems: 'center', marginLeft: 60, color: 'black', fontSize: '16px'}} to={path}>{title}</Link>
    </span>;
    },
    menu: {
      params: {
        pathname: initialState?.pathname,
      },
      request: async (params: Record<string, any>, defaultMenuData: MenuDataItem[]) => {
        const pathnameSplit = params.pathname.split('/').filter((item: string) => item !== '' && item !== 'groups');
        const { length } = pathnameSplit;
        // 根路径用默认菜单
        if (length === 0 || pathnameSplit[0] === 'new') {
          return defaultMenuData;
        }
        let path = pathnameSplit[0];
        for (let i = 1; i < pathnameSplit.length; i += 1) {
          const v = pathnameSplit[i];
          if (v === '-') {
            break
          }
          path = `${path}/${v}`
        }
        return loopMenuItem(formatGroupMenu(path));
      },
    },
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    ...initialState?.settings,
  };
};

function formatGroupMenu(path: string) {
  return [
    ...Utils.getStaticRoutes(),
    {
      name: 'Group overview',
      icon: 'bank',
      children: [
        {
          path: `/${path}`,
          name: 'Details',
        },
        {
          path: `/groups/${path}/-/activity`,
          name: 'Activity',
        },
      ],
    },
    {
      path: `/groups/${path}/-/members`,
      name: 'Members',
      icon: 'contacts',
    },
    {
      path: `/groups/${path}/-/settings`,
      name: 'Settings',
      icon: 'setting',
      children: [
        {
          path: `/groups/${path}/-/edit`,
          name: 'General',
        }
      ]
    },
  ];
}
