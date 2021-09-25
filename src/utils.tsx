import type {Route} from "antd/lib/breadcrumb/Breadcrumb";

const getResourcePath = (pathname: string) => {
  const filteredPath = pathname.split('/').filter(item => item !== '' && item !== 'groups')
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

const getBreadcrumb = (pathname: string | undefined, fullName: string | undefined) => {
  const result: Route[] = [];
  if (!fullName || !pathname) {
    return result;
  }

  const filteredFullName = fullName.split('/').filter(item => item !== '');
  const filteredPath = pathname.split('/').filter(item => item !== '');
  let currentLink = '';
  for (let i = 0; i < filteredPath.length; i += 1) {
    const item = filteredPath[i];
    currentLink += `/${item}`;
    result.push({
      path: currentLink,
      breadcrumbName: filteredFullName[i]
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

  return count % 7 + 1;
}

const getStaticRoutes = () => {
  return [
    {
      path: '/user',
      layout: false,
      routes: [
        {
          path: '/user',
          routes: [
            {
              name: '登录',
              path: '/user/login',
              component: '@/pages/user/Login',
            },
          ],
        },
      ],
    },
    {
      path: '/404',
      menuRender: false,
      component: '@/pages/404',
    },
    {
      path: '/',
      menuRender: false,
      redirect: '/dashboard/groups',
    },
    {
      path: '/dashboard/groups',
      menuRender: false,
      component: '@/pages/dashboard/groups',
    },
    {
      path: '/dashboard/groups/',
      menuRender: false,
      redirect: '/dashboard/groups',
    },
    {
      path: '/groups/new',
      menuRender: false,
      component: '@/pages/group/New',
    }
  ]
}

export default {
  getResourcePath,
  getBreadcrumb,
  getAvatarColorIndex,
  getStaticRoutes
}
