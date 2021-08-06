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
    name: 'Groups',
    hideInMenu: true,
  },
  {
    path: '/dashboard/groups',
    menuRender: false,
    component: './dashboard/groups',
    name: 'Groups',
    hideInMenu: true,
  },
  {
    path: '/*',
    name: 'group',
    icon: 'smile',
    key: 'Group name',
  },
  {
    name: 'Group overview',
    icon: 'bank',
    key: 'Group overview',
    path: '/*',
    routes: [
      {
        path: '/*',
        name: 'Details',
        component: './group/Details',
      },
      {
        path: '/group/*/-/activity',
        name: 'Activity',
        component: './group/Activity',
      },
    ],
  },
  {
    path: '/group/*/-/members',
    name: 'Members',
    icon: 'contacts',
    component: './group/Members',
  },
  {
    path: '/group/*/-/settings',
    name: 'Settings',
    icon: 'setting',
    component: './group/Settings',
  },
  {
    component: './404',
  },
];
