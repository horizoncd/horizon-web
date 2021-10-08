export const routes = [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: '登录',
        path: '/user/login',
        component: 'user/Login',
      },
    ],
  },
  {
    path: '/',
    menuRender: false,
    redirect: '/dashboard/groups',
  },
  {
    path: '/dashboard/groups',
    menuRender: false,
    component: 'dashboard/groups',
  },
  {
    path: '/groups/new',
    menuRender: false,
    component: 'groups/New',
  },
  {
    path: '/applications/new',
    menuRender: false,
    component: 'applications/new',
  }
];

const groupRoutes = [
  {
    path: '/groups/*/-/members',
    component: 'groups/Members',
  },
  {
    path: '/groups/*/-/settings',
    component: 'groups/Settings',
  },
  {
    path: '/groups/*/-/edit',
    component: 'groups/Edit',
  },
  {
    path: '/groups/*/-/activity',
    component: 'groups/Activity',
  },
];

const applicationRoutes = [
  {
    path: '/applications/*/-/members',
    component: 'applications/member',
  },
  {
    path: '/applications/*/-/settings',
    component: 'applications/settings',
  },
  {
    path: '/applications/*/-/edit',
    component: 'applications/edit',
  },
  {
    path: '/applications/*/-/activity',
    component: 'applications/activity',
  },
];

const allRoute = []
allRoute.push(...routes)
allRoute.push(...groupRoutes)
allRoute.push(...applicationRoutes)
// @ts-ignore
allRoute.push({
  path: '/*',
  component: 'detail'
});

export default allRoute;
