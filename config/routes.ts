export const routes = [
  {
    path: '/user/login',
    layout: false,
    component: 'user/Login',
  },
  {
    path: '/user/login/callback',
    layout: false,
    component: 'user/Callback',
  },
  {
    path: '/templates',
    menuRender: false,
    component: "templates",
  },
  {
    path: '/templates/new',
    menuRender: false,
    component: 'templates/New',
  },
  {
    path: '/',
    menuRender: false,
    redirect: '/dashboard/instances',
  },
  {
    path: '/dashboard/groups',
    menuRender: false,
    component: 'dashboard/Groups',
  },
  {
    path: '/dashboard/applications',
    menuRender: false,
    component: 'dashboard/Applications',
  },
  {
    path: '/dashboard/instances',
    menuRender: false,
    component: 'dashboard/Instances',
  },
  {
    path: '/groups/new',
    menuRender: false,
    component: 'groups/NewGroup',
  },
  {
    path: '/profile',
    component: 'user/Detail',
  },
];

const groupRoutes = [
  {
    path: '/groups/*/-/members',
    component: 'groups/Member',
  },
  {
    path: '/groups/*/-/settings',
    component: 'groups/config/Basic',
  },
  {
    path: '/groups/*/-/settings/basic',
    component: 'groups/config/Basic',
  },
  {
    path: '/groups/*/-/settings/advance',
    component: 'groups/config/Advance'
  }, {
    path: '/groups/*/-/settings/oauthapps',
    component: 'groups/config/Oauthapp'
  }, {
    path: '/groups/*/-/settings/oauthapps/:id',
    component: 'oauthapp/Detail',
  },
  {
    path: '/groups/*/-/activity',
    component: 'groups/Activity',
  },
  {
    path: '/groups/*/-/newsubgroup',
    menuRender: false,
    component: 'groups/NewSubGroup',
  }, {
    path: '/groups/*/-/newapplicationv1',
    menuRender: false,
    component: 'applications/NewOrEdit/v1',
  }, {
    path: '/groups/*/-/newapplicationv2',
    menuRender: false,
    component: 'applications/NewOrEdit/v2/Navigation',
  },{
    path: '/groups/*/-/newapplicationv2/git',
    menuRender: false,
    component: 'applications/NewOrEdit/v2/GitImport',
  },{
    path: '/groups/*/-/newapplicationv2/image',
    menuRender: false,
    component: 'applications/NewOrEdit/v2/ImageDeploy',
  },
  {
    path: '/groups/*/-/newapplicationv2/chart',
    menuRender: false,
    component: 'applications/NewOrEdit/v2/ChartDeploy',
  },
  {
    path: '/groups/*/-/(newapplicationv2|newinstancev2)/chartcatalog',
    menuRender: false,
    component: 'applications/NewOrEdit/v2/Catalog',
  },
  {
    path: `/groups/*/-/newoauthapp`,
    menuRender: false,
    component: 'oauthapp/New'
  },
  {
    path: `/groups/*/-/settings/accesstokens`,
    menuRender: false,
    component: 'accesstoken/ResourceAccessToken'
  }
];

const applicationRoutes = [
  {
    path: '/applications/*/-/tags',
    menuRender: false,
    component: 'applications/Tag',
  },
  {
    path: '/applications/*/-/members',
    component: 'applications/Member',
  },
  {
    path: '/applications/*/-/configs',
    component: 'applications/Detail',
  },
  {
    path: '/applications/*/-/pipelines',
    component: 'instances/pipelines/New',
  },
  {
    path: '/applications/*/-/edit',
    menuRender: false,
    component: 'applications/NewOrEdit/v1',
  },
  {
    path: '/applications/*/-/editv2',
    menuRender: false,
    component: 'applications/NewOrEdit/v2/Navigation',
  },
  {
    path: '/applications/*/-/editv2/git',
    menuRender: false,
    component: 'applications/NewOrEdit/v2/GitImport',
  },
  {
    path: '/applications/*/-/editv2/image',
    menuRender: false,
    component: 'applications/NewOrEdit/v2/ImageDeploy',
  },
  {
    path: '/applications/*/-/editv2/chart',
    menuRender: false,
    component: 'applications/NewOrEdit/v2/ChartDeploy',
  },
  {
    path: '/applications/*/-/newinstance',
    menuRender: false,
    component: 'instances/NewOrEdit/Navigation',
  },
  {
    path: '/applications/*/-/newinstance/git',
    menuRender: false,
    component: 'applications/NewOrEdit/v1',
  },
  {
    path: '/applications/*/-/newinstancev2',
    menuRender: false,
    component: 'instances/NewOrEdit/Navigation',
  },
  {
    path: '/applications/*/-/newinstancev2/chartcatalog',
    menuRender: false,
    component: 'instances/NewOrEdit/v2/Catalog',
  },
  {
    path: '/applications/*/-/newinstancev2/git',
    menuRender: false,
    component: 'instances/NewOrEdit/v2/GitImport',
  },
  {
    path: '/applications/*/-/newinstancev2/image',
    menuRender: false,
    component: 'instances/NewOrEdit/v2/ImageDeploy',
  },
  {
    path: '/applications/*/-/newinstancev2/chart',
    menuRender: false,
    component: 'instances/NewOrEdit/v2/ChartDeploy',
  },
  {
    path: '/applications/*/-/settings/advance',
    component: 'applications/config/Advance',
  },
  {
    path: '/applications/*/-/stats/pipeline',
    component: 'applications/stats/Pipeline',
  },
  {
    path: '/applications/*/-/settings/accesstokens',
    menuRender: false,
    component: 'accesstoken/ResourceAccessToken'
  }
];

const instanceRoutes = [
  {
    path: '/instances/*/-/edit',
    menuRender: false,
    component: 'instances/NewOrEdit/v1',
  },
  {
    path: '/instances/*/-/editv2',
    menuRender: false,
    component: 'instances/NewOrEdit/Navigation',
  },
  {
    path: '/instances/*/-/editv2/git',
    menuRender: false,
    component: 'instances/NewOrEdit/v2/GitImport',
  },
  {
    path: '/instances/*/-/editv2/image',
    menuRender: false,
    component: 'instances/NewOrEdit/v2/ImageDeploy',
  },
  {
    path: '/instances/*/-/editv2/chart',
    menuRender: false,
    component: 'instances/NewOrEdit/v2/ChartDeploy',
  },
  {
    path: '/instances/*/-/configs',
    component: 'instances/Detail',
  },
  {
    path: '/instances/*/-/pods/:name',
    menuRender: false,
    component: 'instances/Pod',
  },
  {
    path: '/instances/*/-/pipelines',
    component: 'instances/pipelines/History',
  },
  {
    path: '/instances/*/-/pipelines/new',
    component: 'instances/pipelines/New',
  },
  {
    path: '/instances/*/-/pipelines/:id',
    component: 'instances/pipelines/Detail',
  },
  {
    path: '/instances/*/-/members',
    component: 'instances/Member',
  },
  {
    path: '/instances/*/-/webconsole',
    menuRender: false,
    component: 'instances/Pods/Console',
  },
  {
    path: '/instances/*/-/monitoring',
    component: 'instances/Monitor',
  },
  {
    path: '/instances/*/-/tags',
    menuRender: false,
    component: 'instances/Tag',
  },
  {
    path: '/instances/*/-/admintags',
    menuRender: false,
    component: 'instances/AdminTag',
  },
  {
    path: '/instances/*/-/settings/accesstokens',
    menuRender: false,
    component: 'accesstoken/ResourceAccessToken'
  }
];

const adminRoutes = [
  {
    path: '/admin',
    redirect: '/admin/kubernetes',
  },
  {
    path: '/admin/kubernetes',
    component: 'admin/Kubernetes'
  },
  {
    path: '/admin/environments',
    component: 'admin/Environments'
  },
  {
    path: '/admin/registries',
    component: 'admin/Registries'
  },
  {
    path: '/admin/idps',
    component: 'admin/IDPs/Main'
  },
  {
    path: '/admin/kubernetes/new',
    component: 'admin/Kubernetes/New'
  }, {
    path: '/admin/kubernetes/:id',
    component: 'admin/Kubernetes/Detail'
  }, {
    path: '/admin/kubernetes/:id/edit',
    component: 'admin/Kubernetes/Edit'
  }, {
    path: '/admin/registries/new',
    component: 'admin/Registries/New'
  }, {
    path: '/admin/registries/:id',
    component: 'admin/Registries/Detail'
  }, {
    path: '/admin/registries/:id/edit',
    component: 'admin/Registries/Edit'
  }, {
    path: '/admin/environments/new',
    component: 'admin/Environments/New'
  }, {
    path: '/admin/environments/:id',
    component: 'admin/Environments/Detail'
  }, {
    path: '/admin/environments/:id/edit',
    component: 'admin/Environments/Edit'
  }, {
    path: '/admin/idps/:id/edit',
    component: 'admin/IDPs/Edit',
  }, {
    path: '/admin/idps/new',
    component: 'admin/IDPs/New',
  }, {
    path: '/admin/idps/:id',
    component: 'admin/IDPs/Detail',
  }, {
    path: '/admin/users',
    component: 'admin/Users'
  }, {
    path: '/admin/users/:id',
    component: 'admin/Users/Detail'
  }
]

const userRoutes = [
  {
    path: '/profile',
    redirect: '/profile/user',
  },
  {
    path: '/profile/user',
    component: 'user/Detail'
  },
  {
    path: '/profile/personalaccesstoken',
    component: 'accesstoken/PersonalAccessToken'
  }
]

adminRoutes.forEach((route) => {
  route['wrappers'] = [
    '@/wrappers/auth',
  ]
})

const templateRoutes = [
  {
    path: '/groups/*/-/templates',
    component: 'templates/Group'
  },
  {
    path: '/groups/*/-/newtemplate',
    component: 'templates/New'
  },
  {
    path: '/templates/*/-/detail',
    component: 'templates/Detail',
  },
  {
    path: '/templates/*/-/edit',
    component: 'templates/Edit',
  },
  {
    path: '/templates/*/-/members',
    component: 'templates/Member',
  },
  {
    path: '/templates/*/-/releases',
    component: 'templates/Releases',
  },
  {
    path: '/templates/*/-/newrelease',
    component: 'templates/Releases/New',
  },
  {
    path: '/templates/*/-/releases/*/edit',
    component: 'templates/Releases/Edit',
  },
  {
    path: '/templates/*/-/releases/*',
    component: 'templates/Releases/Detail',
  },
]

const webhookRoutes = [
  {
    path: '/admin/webhooks',
    component: 'webhooks',
    wrappers: [
      '@/wrappers/auth',
    ],
  },
  {
    path: '/admin/webhooks/new',
    component: 'webhooks/New'
  },
  {
    path: '/admin/webhooks/:id',
    component: 'webhooks/LogList'
  },
  {
    path: '/admin/webhooks/:id/edit',
    component: 'webhooks/Edit'
  },
  {
    path: '/admin/webhooks/:webhookID/:id',
    component: 'webhooks/LogDetail'
  },
  {
    path: '/groups/*/-/settings/webhooks',
    component: 'webhooks'
  },
  {
    path: '/groups/*/-/settings/newwebhook',
    component: 'webhooks/New'
  },
  {
    path: '/groups/*/-/settings/webhooks/:id',
    component: 'webhooks/LogList'
  },
  {
    path: '/groups/*/-/settings/webhooks/:id',
    component: 'webhooks/LogList'
  },
  {
    path: '/groups/*/-/settings/webhooks/:id/edit',
    component: 'webhooks/Edit'
  },
  {
    path: '/groups/*/-/settings/webhooks/:webhookID/:id',
    component: 'webhooks/LogDetail'
  },
  {
    path: '/applications/*/-/settings/webhooks',
    component: 'webhooks'
  },
  {
    path: '/applications/*/-/settings/newwebhook',
    component: 'webhooks/New'
  },
  {
    path: '/applications/*/-/settings/webhooks/:id',
    component: 'webhooks/LogList'
  },
  {
    path: '/applications/*/-/settings/webhooks/:id/edit',
    component: 'webhooks/Edit'
  },
  {
    path: '/applications/*/-/settings/webhooks/:webhookID/:id',
    component: 'webhooks/LogDetail'
  },
  {
    path: '/instances/*/-/settings/webhooks',
    component: 'webhooks'
  },
  {
    path: '/instances/*/-/settings/newwebhook',
    component: 'webhooks/New'
  },
  {
    path: '/instances/*/-/settings/webhooks/:id',
    component: 'webhooks/LogList'
  },
  {
    path: '/instances/*/-/settings/webhooks/:id/edit',
    component: 'webhooks/Edit'
  },
  {
    path: '/instances/*/-/settings/webhooks/:webhookID/:id',
    component: 'webhooks/LogDetail'
  },
]

const allRoute = [];
allRoute.push(...routes);
allRoute.push(...groupRoutes);
allRoute.push(...applicationRoutes);
allRoute.push(...instanceRoutes);
allRoute.push(...adminRoutes);
allRoute.push(...templateRoutes);
allRoute.push(...userRoutes);
allRoute.push(...webhookRoutes);
// @ts-ignore
allRoute.push({
  path: '/*',
  component: 'Detail',
});

export default allRoute;
