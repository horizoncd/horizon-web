import type {Route} from 'antd/lib/breadcrumb/Breadcrumb';
import {history} from 'umi';
import {getLocale} from "@@/plugin-locale/localeExports";
import moment, { isMoment } from 'moment';

const roles = {
  Owner: 'owner',
  Maintainer: 'maintainer',
  Developer: 'developer',
  Reporter: 'reporter',
  Guest: 'guest',
  PE: 'pe',
  NotExist: 'notExist'
};

const actions = {
  ManageMember: "manage member",
};

// 角色、操作、资源的对应关系
// 如：developer在管理member时，只能操作developer、reporter、guest，无法操作owner、maintainer
const rolePermissions = {
  [roles.Owner]: {
    [actions.ManageMember]: [roles.Owner, roles.Maintainer, roles.Developer, roles.Reporter, roles.PE, roles.Guest],
  },
  [roles.Maintainer]: {
    [actions.ManageMember]: [roles.Maintainer, roles.Developer, roles.Reporter, roles.PE, roles.Guest],
  },
  [roles.Developer]: {
    [actions.ManageMember]: [roles.Developer, roles.Reporter, roles.PE, roles.Guest],
  },
  [roles.Reporter]: {
    [actions.ManageMember]: [roles.Reporter, roles.PE, roles.Guest],
  },
  [roles.PE]: {
    [actions.ManageMember]: [roles.PE, roles.Guest],
  },
  [roles.Guest]: {
    [actions.ManageMember]: [roles.Guest],
  },
  [roles.NotExist]: {
    [actions.ManageMember]: [],
  }
};

const getResourcePath = () => {
  const {pathname} = history.location;
  const filteredPath = pathname.split('/').filter((item) => item !== '' && item !== 'groups' &&
    item !== 'applications' && item !== 'clusters');
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
  const filteredPath = pathname.split('/').filter((item) => item !== '' && item !== 'groups' &&
    item !== 'applications' && item !== 'clusters');
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

  const p = pathname.split('/').filter((item) => item !== '');
  const idx = p.indexOf('-')
  const funcURL = idx > -1
  if (funcURL) {
    currentLink += `/-`;
    for (let i = idx + 1; i < p.length; i += 1) {
      const item = p[i];
      currentLink += `/${item}`;
      result.push({
        path: `/${p[0]}${currentLink}`,
        breadcrumbName: item,
      });
    }
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
  return moment(oldTime).local().locale(getLocale()).fromNow()
}

export const mergeDefaultValue = (value: any, defaultValue: { [x: string]: any; }) => {
  const result = {
    ...value,
  };
  Object.keys(defaultValue || {}).forEach((e) => {
    const isNull = defaultValue[e] != null && result[e] == null;
    if (Array.isArray(defaultValue[e])) {
      if (isNull) {
        result[e] = Array.from(defaultValue[e]);
      }
      return;
    }
    if (isMoment(defaultValue[e])) {
      if (isNull) {
        result[e] = moment(defaultValue[e]);
      }
      return;
    }
    if (typeof defaultValue[e] === 'object') {
      result[e] = mergeDefaultValue(result[e], defaultValue[e]);
      return;
    }
    if (isNull) {
      result[e] = defaultValue[e];
    }
  });
  return result;
};

/**
 * 格式化参数
 *
 * @param {any} data - 需格式化的值
 * @param {string|function} type - 格式化类型
 * @returns {any} 格式化后的值
 */
// @ts-ignore
const formatValue = (data, type) => {
  if (data === undefined) {
    return data;
  }
  if (type instanceof Function) {
    return type(data);
  }
  if (type === 'array') {
    if (data instanceof Array) {
      return data;
    }
    if (typeof data === 'string') {
      return data.split(',');
    }
    if (typeof data === 'number') {
      return [data];
    }
    return [data];
  }
  if (data instanceof Array) {
    return data.map(e => formatValue(e, type));
  }
  if (type === 'number') {
    if (typeof data === 'number') {
      return data;
    }
    if (typeof data === 'string') {
      return +data;
    }
    return +data;
  }
  if (type === 'string') {
    if (typeof data === 'number') {
      return `${data}`;
    }
    if (typeof data === 'string') {
      return data;
    }
    return `${data}`;
  }
  if (type === 'boolean') {
    if (typeof data === 'boolean') {
      return data;
    }
    // eslint-disable-next-line no-self-compare
    if (typeof data === 'number' || +data === +data) {
      return !!+data;
    }
    if (typeof data === 'string') {
      return data === 'true';
    }
    return !!data;
  }
  if (type === 'moment') {
    return moment(data, [moment.ISO_8601, 'x', 'YYYY-MM-DD HH:mm:ss']);
  }
  return data;
};

/**
 * 格式化表单数据
 *
 * @param {object} data - 原始数据
 * @param {object} [options={}] - 格式化参数
 * @returns {object} 格式化后数据
 */
// @ts-ignore
export const formatQueryParam = (data, options ) => {
  const result = { ...data };

  Object.keys(options).forEach((key) => {
    if (data[key] === undefined) {
      return;
    }
    let formatter = options[key];
    if (formatter === false) {
      delete result[key];
      return;
    }
    if (!(formatter instanceof Array)) {
      formatter = [formatter];
    }

    // @ts-ignore
    result[key] = formatter.reduce((pre, e) => formatValue(pre, e), data[key]);
  });

  return result;
};

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
