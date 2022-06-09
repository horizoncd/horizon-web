import {history} from 'umi';
import {getLocale} from "@@/plugin-locale/localeExports";
import moment, {isMoment} from 'moment';
import {routes} from "../config/routes";

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
  const result = [];
  const {pathname} = history.location;
  if (pathname.startsWith("/admin/")) {
    const filteredPath = pathname.split('/').filter((item) => item !== '')
    let currentLink = '';
    for (let i = 0; i < filteredPath.length; i += 1) {
      const item = filteredPath[i];
      currentLink += `/${item}`;
      result.push({
        path: currentLink,
        breadcrumbName: item,
      });
    }
    return result
  }

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
        subResource: true,
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

// 计算出某个时间点是当前多久以前
function timeFromNow(oldTime: string) {
  return moment(oldTime).local().locale(getLocale()).fromNow()
}

// 计算出某个时间点是当前多久以前 by en-US
function timeFromNowEnUS(oldTime: string) {
  return moment(oldTime).local().locale('en-US').fromNow()
}

// 计算出两个时间点之间的间隔
function timeSecondsDuration(startedAt: string, finishedAt: string) {
  return moment(finishedAt).diff(moment(startedAt), "seconds")
}

// 将日期转为浏览器当前时区
function timeToLocal(time: string) {
  return moment(time).local().format('YYYY-MM-DD HH:mm:ss').toString()
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
export const formatQueryParam = (data, options) => {
  const result = {...data};

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

export const pathnameInStaticRoutes = (): boolean => {
  const {pathname} = history.location;

  if (pathname.startsWith('/oauthapps')) {
    return true
  }
  // handle url end with '/'
  let path = pathname;
  if (pathname.startsWith("/admin/")) {
    return true
  }
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

export const handleHref = (event: any, link: string) => {
  const {metaKey, ctrlKey} = event

  // mac 平台 判断 metaKey; 其他平台判断ctrlKey
  // https://developer.mozilla.org/en-US/docs/web/api/navigator/platform#browser_compatibility
  // mozilla 建议换成 navigator.userAgentData.platform 但浏览器兼容性不足 后续看情况再调整
  if (navigator.platform.indexOf('Mac') > -1 && metaKey) {
    window.open(link)
    return
  }
  if (navigator.platform.indexOf('Mac') === -1 && ctrlKey) {
    window.open(link)
    return;
  }
  window.location.href = link
}

export default {
  getResourcePath,
  getBreadcrumbs,
  getAvatarColorIndex,
  timeFromNow,
  timeFromNowEnUS,
  timeToLocal,
  timeSecondsDuration,
};
