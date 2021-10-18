import type {Route} from 'antd/lib/breadcrumb/Breadcrumb';
import {history} from 'umi';

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
  if (pathname.indexOf('-') > -1) {
    const p = pathname.split('/')
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

export default {
  getResourcePath,
  getBreadcrumbs,
  getAvatarColorIndex,
};
