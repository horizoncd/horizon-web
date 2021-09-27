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
    path: '/404',
    menuRender: false,
    component: '404',
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
    path: '/dashboard/groups/',
    menuRender: false,
    redirect: '/dashboard/groups',
  },
  {
    path: '/groups/new',
    menuRender: false,
    component: 'groups/New',
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

const allRoute = []
allRoute.push(...routes)
allRoute.push(...groupRoutes)
// @ts-ignore
allRoute.push({
  path: '/*',
  component: 'detail'
});

export default allRoute;
