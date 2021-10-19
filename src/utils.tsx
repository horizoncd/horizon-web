import type {Route} from 'antd/lib/breadcrumb/Breadcrumb';
import {history} from 'umi';
import moment from "moment";
import {getLocale} from "@@/plugin-locale/localeExports";

const roles = {
  Owner: "Owner",
  Maintainer: "Maintainer",
  Developer: "Developer",
  Reporter: "Reporter",
  Guest: "Guest",
};

const actions = {
  ManageMember: "manage member",
};

// 角色、操作、资源的对应关系
// 如：developer在管理member时，只能操作developer、reporter、guest，无法操作owner、maintainer
const rolePermissions = {
  [roles.Owner]: {
    [actions.ManageMember]: [roles.Owner, roles.Maintainer, roles.Developer, roles.Reporter, roles.Guest],
  },
  [roles.Maintainer]: {
    [actions.ManageMember]: [roles.Maintainer, roles.Developer, roles.Reporter, roles.Guest],
  },
  [roles.Developer]: {
    [actions.ManageMember]: [roles.Developer, roles.Reporter, roles.Guest],
  },
  [roles.Reporter]: {
    [actions.ManageMember]: [roles.Reporter, roles.Guest],
  },
  [roles.Guest]: {
    [actions.ManageMember]: [roles.Guest],
  },
};

const getResourcePath = () => {
  const {pathname} = history.location;
  const filteredPath = pathname.split('/').filter((item) => item !== '' && item !== 'groups' && item !== 'applications');
  let path = '';
  for (let i = 0; i < filteredPath.length; i += 1) {
    const item = filteredPath[i];
    if (item === '-') {
      break;
    }
    path += `/${item}`;
  }
  return path;
};

const getBreadcrumbs = (fullName: string) => {
  const result: Route[] = [];
  const {pathname} = history.location;

  const filteredFullName = fullName.split('/').filter((item) => item !== '');
  const filteredPath = pathname.split('/').filter((item) => item !== '' && item !== 'groups' && item !== 'applications');
  let currentLink = '';
  for (let i = 0; i < filteredPath.length; i += 1) {
    const item = filteredPath[i];
    if (item === '-') {
      break;
    }
    currentLink += `/${item}`;
    result.push({
      path: currentLink,
      breadcrumbName: filteredFullName[i],
    });
  }

  // add current route
  const p = pathname.split('/')
  if (p.indexOf('-') > -1) {
    result.push({
      path: pathname,
      breadcrumbName: p[p.length - 1],
    });
  }

  return result;
};

const getAvatarColorIndex = (title: string) => {
  let count = 0;
  for (let i = 0; i < title.length; i += 1) {
    const t = title[i];
    const n = t.charCodeAt(0);
    count += n;
  }

  return (count % 7) + 1;
};

// 基于rbac判断某个操作是否被允许，可用于作为组件隐藏、置灰的条件
const permissionAllowed = (role: string, action: string, resource: string) => {
  let allowed = false;
  if (rolePermissions[role][action].includes(resource)) {
    allowed = true
  }
  return allowed
};

// 计算出某个时间点是当前多久以前
function timeFromNow(oldTime: string) {
  return moment(oldTime, "YYYY-MM-DD HH:mm:ss").locale(getLocale()).fromNow()
}

export default {
  roles,
  actions,
  rolePermissions,
  getResourcePath,
  getBreadcrumbs,
  getAvatarColorIndex,
  permissionAllowed,
  timeFromNow,
};
