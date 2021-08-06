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
    name: 'Group overview',
    icon: 'bank',
    routes: [
      {
        path: '/:team',
        name: 'Details',
        component: './group/Details',
      },
      {
        path: '/team/:team/-/activity',
        name: 'Activity',
        component: './group/Activity',
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
    name: 'Teams',
    hideInMenu: true,
    layout: 'top'
  },
  {
    component: './404',
  },
];
