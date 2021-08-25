const routes = [
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
            component: 'user/Login',
          },
        ],
      },
    ],
  },
  {
    path: '/',
    menuRender: false,
    component: 'dashboard/groups',
  },
  {
    path: '/groups/new',
    menuRender: false,
    component: 'group/New',
  }
];

const groupRoutes = [
  {
    path: '/groups/*/-/members',
    component: 'group/Members',
  },
  {
    path: '/groups/*/-/settings',
    component: 'group/Settings',
  },
  {
    path: '/groups/*/-/edit',
    component: 'group/Edit',
  },
  {
    path: '/groups/*/-/activity',
    component: 'group/Activity',
  },
];

// @ts-ignore
routes.push(...groupRoutes)
// @ts-ignore
routes.push({
  path: '/*',
  component: 'detail/Details'
});

export default routes;
