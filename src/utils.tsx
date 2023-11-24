import { history } from 'umi';
import { getLocale } from '@@/plugin-locale/localeExports';
import moment, { isMoment } from 'moment';
import { routes } from '../config/routes';
import { IndexURL, RedirectURL } from './const';

const getResourcePath = () => {
  const { pathname } = history.location;
  if (pathname.startsWith('/templates')) {
    const pathArr = /templates\/(.*?)\/-\/releases\/(.*?)(?:\/edit)?\/?$/.exec(pathname);
    if (pathArr != null) {
      return `/${pathArr[1]}/${pathArr[2]}`;
    }
  }
  const filteredPath = pathname
    .split('/')
    .filter(
      (item) => item !== ''
        && item !== 'groups'
        && item !== 'applications'
        && item !== 'instances'
        && item !== 'templates',
    );
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

const getAppNameIfSimpleRoute = () => {
  // simple route is defined as a route without group full path, such as /applications/-/app1/-/detail
  const { pathname } = history.location;
  if (pathname.startsWith('/applications/-/') || pathname.startsWith('/instances/-/')) {
    const filteredPath = pathname.split('/').filter((item) => item !== '');
    if (filteredPath.length < 3) {
      return '';
    }
    return filteredPath[2];
  }
  return '';
};

const fillSimpleRoute = (groupFullPath: string) => {
  const { pathname } = history.location;
  let res = pathname;
  if (pathname.startsWith('/applications/-/') || pathname.startsWith('/instances/-/')) {
    // groupFullPath: /group1/subgroup2
    // replace /applications/-/ with /applications/group1/subgroup2/
    res = res.replace(/\/-\//, `${groupFullPath}/`);
  }
  return res;
};

const getBreadcrumbs = (fullName: string) => {
  const result = [];
  const { pathname } = history.location;
  if (pathname.startsWith('/admin/') || pathname.startsWith('/profile')) {
    const filteredPath = pathname.split('/').filter((item) => item !== '');
    let currentLink = '';
    for (let i = 0; i < filteredPath.length; i += 1) {
      const item = filteredPath[i];
      currentLink += `/${item}`;
      result.push({
        path: currentLink,
        breadcrumbName: item,
      });
    }
    return result;
  }

  if (pathname.startsWith('/templates')) {
    if (pathname === '/templates/new') {
      return result;
    }
    const releasePattern = /\/templates\/.*\/-\/releases\/(.*?)(\/edit)?\/?$/;
    const isRelease = releasePattern.test(pathname);
    const path = pathname.replace(/\/-.+$/, '');
    const filteredPath = path.split('/').filter((item) => item !== '' && item !== 'templates');
    let currentLink = '';
    filteredPath.slice(0, filteredPath.length - 1).forEach((x) => {
      currentLink += `/${x}`;
      result.push({
        path: currentLink,
        breadcrumbName: x,
      });
    });
    const item = filteredPath[filteredPath.length - 1];
    currentLink += `/${item}`;
    result.push({
      path: `/templates${currentLink}/-/detail`,
      breadcrumbName: item,
    });
    const res = releasePattern.exec(pathname);
    if (isRelease) {
      currentLink += `/-/releases/${res[1]}`;
      result.push({
        path: `/templates${currentLink}`,
        breadcrumbName: res[1],
      });
      if (pathname.endsWith('/edit')) {
        currentLink += '/edit';
        result.push({
          path: `/templates${currentLink}`,
          breadcrumbName: 'edit',
        });
      }
    }
    return result;
  }

  const filteredFullName = fullName.split('/').filter((item) => item !== '');
  const filteredPath = pathname
    .split('/')
    .filter(
      (item) => item !== '' && item !== 'groups' && item !== 'applications' && item !== 'instances',
    );
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
  const idx = p.indexOf('-');
  const funcURL = idx > -1;
  if (funcURL) {
    currentLink += '/-';
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

function timeFromNow(oldTime: string) {
  return moment(oldTime).local().locale(getLocale()).fromNow();
}

function timeSecondsDuration(startedAt: string, finishedAt: string) {
  return moment(finishedAt).diff(moment(startedAt), 'seconds', true);
}

function timeToLocal(time: string) {
  return moment(time).local().format('YYYY-MM-DD HH:mm:ss').toString();
}

export const mergeDefaultValue = (value: any, defaultValue: { [x: string]: any }) => {
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
    return data.map((e) => formatValue(e, type));
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

// @ts-ignore
export const formatQueryParam = (data, options) => {
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

export const pathnameInStaticRoutes = (): boolean => {
  const { pathname } = history.location;
  // handle url end with '/'
  let path = pathname;
  if (pathname.startsWith('/admin') || pathname.startsWith('/profile')) {
    return true;
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
};

export const handleHref = (event: any, link: string, type: string = 'window') => {
  const { metaKey, ctrlKey } = event;

  // metaKey for macOS; ctrlKey for others
  // https://developer.mozilla.org/en-US/docs/web/api/navigator/platform#browser_compatibility
  if (navigator.platform.indexOf('Mac') > -1 && metaKey) {
    window.open(link);
    return;
  }
  if (navigator.platform.indexOf('Mac') === -1 && ctrlKey) {
    window.open(link);
    return;
  }
  if (type === 'window') {
    window.location.href = link;
  } else {
    history.push(link);
  }
};

// generate oidc authn link
export function IdpSetState(u: string, link: boolean = false, customRedirect?: string) {
  const url = new URL(u);
  let state = url.searchParams.get('state');
  if (state === null) {
    return u;
  }
  state = window.atob(state);

  const stateParams = new URLSearchParams(state);
  let redirect = history.location.query?.redirect ?? IndexURL;
  if (typeof redirect !== 'string') {
    redirect = (redirect as string[]).at(0) || '';
  }
  if (customRedirect) {
    redirect = customRedirect;
  }
  stateParams.set('redirect', redirect);
  stateParams.set('link', link ? 'true' : 'false');
  url.searchParams.set('state', window.btoa(stateParams.toString()));
  url.searchParams.set('redirect_uri', RedirectURL);
  return url.toString();
}

export const tagShouldOmit = (tag: TAG.Tag) => tag.key.length > 16 || tag.value.length > 16;

export const difference = (object: any, other: any) => {
  const diff = {};
  Object.keys(object).forEach((key) => {
    if (typeof object[key] === 'object' && typeof other[key] === 'object' && object[key] && other[key]) {
      const subDiff = difference(object[key], other[key]);
      if (Object.keys(subDiff).length !== 0) {
        diff[key] = subDiff;
      }
    } else if (object[key] !== other[key]) {
      diff[key] = object[key];
    }
  });
  return diff;
};

export default {
  getResourcePath,
  getAppNameIfSimpleRoute,
  fillSimpleRoute,
  getBreadcrumbs,
  getAvatarColorIndex,
  timeFromNow,
  timeToLocal,
  timeSecondsDuration,
  tagShouldOmit,
};
