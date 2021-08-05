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
    path: '/members',
    name: 'Members',
    icon: 'contacts',
    component: './group/Members',
  },
  {
    path: '/settings',
    name: 'Settings',
    icon: 'setting',
    component: './group/Settings',
  },
  {
    path: '/',
    menuRender: false,
    component: './Teams',
    name: 'Teams'
  },
  {
    component: './404',
  },
];
