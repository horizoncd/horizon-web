export default [
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
            component: './user/Login',
          },
        ],
      },
    ],
  },
  {
    path: '/',
    menuRender: false,
    component: './dashboard/groups',
  },
  // group route
  {
    path: '/groups/*/-/members',
    component: './group/Members',
  },
  {
    path: '/groups/*/-/settings',
    component: './group/Settings',
  },
  {
    path: '/groups/*/-/activity',
    component: './group/Activity',
  },
  {
    path: '/groups/new',
    menuRender: false,
    component: './group/New',
  },
  // app route
  {
    path: '/app/*/-/members',
    component: './app/Members',
  },
  {
    path: '/app/*/-/settings',
    component: './app/Settings',
  },
  {
    path: '/app/*/-/activity',
    component: './app/Activity',
  },
  {
    path: '/*',
    component: './detail/Details',
  },
];
