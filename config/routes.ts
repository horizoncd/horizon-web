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
    path: '/teams',
    name: 'Teams',
    icon: 'smile',
    component: './Teams',
  },
  {
    name: 'Group overview',
    icon: 'bank',
    routes: [
      {
        path: '/group/*',
        name: 'Details',
        icon: 'smile',
        component: './group/Details',
      },
      {
        path: '/groups/*/-/activity',
        name: 'Activity',
        icon: 'smile',
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
    redirect: '/teams',
  },
  {
    component: './404',
  },
];
