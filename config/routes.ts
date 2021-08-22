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
    path: '/group/*/-/members',
    component: './group/Members',
  },
  {
    path: '/group/*/-/settings',
    component: './group/Settings',
  },
  {
    path: '/group/*/-/activity',
    component: './group/Activity',
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
  {
    component: './404',
  },
];
