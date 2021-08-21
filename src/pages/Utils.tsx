const getResourcePath = (pathname: string) => {
  const filteredPath = pathname.split('/').filter(item => item !== '' && item !== 'group')
  let path = '';
  for (let i = 0; i < filteredPath.length; i += 1) {
    const item = filteredPath[i];
    if (item === '-') {
      break
    }
    path += `/${item}`
  }
  return path;
};

const getResourceName = (pathname: string) => {
  const filteredPath = pathname.split('/').filter(item => item !== '')
  let name = '';
  for (let i = 0; i < filteredPath.length; i += 1) {
    const item = filteredPath[i];
    if (item === '-') {
      break
    }
    name = item
  }
  return name;
};

const getBreadcrumb = (pathname: string) => {
  let currentLink = '';
  return getResourcePath(pathname).split('/')
    .map(item => {
      currentLink += `/${item}`;
      return {
        path: currentLink,
        breadcrumbName: item
      }
    });
};

export default {
  getResourcePath,
  getResourceName,
  getBreadcrumb
}
