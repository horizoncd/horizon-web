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
    path: '/:team',
    icon: 'smile',
    name: 'team',
    key: 'title',
  },
  {
    name: 'Group overview',
    icon: 'bank',
    path: '/:team',
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
    path: '/team/:team/-/members',
    name: 'Members',
    icon: 'contacts',
    component: './group/Members',
  },
  {
    path: '/team/:team/-/settings',
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
    layout: 'top',
  },
  {
    component: './404',
  },
];
