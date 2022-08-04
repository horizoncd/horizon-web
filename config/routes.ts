import component from "@/locales/en-US/component";

export const routes = [
  {
    path: '/user/login',
    layout: false,
    component: 'user/Login',
  },
  {
    path: '/admin',
    redirect: '/admin/kubernetes',
  },
  {
    path: '/admin/kubernetes',
    component: 'admin/Kubernetes',
    wrappers: [
      '@/wrappers/auth',
    ],
  },
  {
    path: '/admin/environments',
    component: 'admin/Environments',
    wrappers: [
      '@/wrappers/auth',
    ],
  },
  {
    path: '/admin/harbors',
    component: 'admin/Harbors',
    wrappers: [
      '@/wrappers/auth',
    ],
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
    redirect: '/dashboard/clusters',
  },
  {
    path: '/explore/groups',
    menuRender: false,
    component: 'dashboard',
  },
  {
    path: '/dashboard/applications',
    menuRender: false,
    component: 'dashboard',
  },
  {
    path: '/explore/applications',
    menuRender: false,
    component: 'dashboard',
  },
  {
    path: '/dashboard/clusters',
    menuRender: false,
    component: 'dashboard',
  },
  {
    path: '/explore/clusters',
    menuRender: false,
    component: 'dashboard',
  },
  {
    path: '/groups/new',
    menuRender: false,
    component: 'groups/NewGroup',
  },
  {
    path: '/slo',
    menuRender: false,
    component: 'more/SLO',
  },
];

const groupRoutes = [
  {
    path: '/groups/*/-/members',
    component: 'groups/Member',
  },
  {
    path: '/groups/*/-/settings',
    component: 'groups/Settings',
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
  },
  {
    path: '/groups/*/-/newapplication',
    menuRender: false,
    component: 'applications/NewOrEdit',
  },
  {
    path: `/groups/*/-/newoauthapp`,
    menuRender: false,
    component: 'oauthapp/New'
  }
];

const applicationRoutes = [
  {
    path: '/applications/*/-/members',
    component: 'applications/Member',
  },
  {
    path: '/applications/*/-/clusters',
    component: 'applications/Clusters',
  },
  {
    path: '/applications/*/-/pipelines',
    component: 'clusters/pipelines/New',
  },
  {
    path: '/applications/*/-/edit',
    menuRender: false,
    component: 'applications/NewOrEdit',
  },
  {
    path: '/applications/*/-/clusters/new',
    menuRender: false,
    component: 'clusters/NewOrEdit',
  },
  {
    path: '/applications/*/-/settings/advance',
    component: 'applications/config/Advance',
  }
];

const clusterRoutes = [
  {
    path: '/clusters/*/-/edit',
    menuRender: false,
    component: 'clusters/NewOrEdit',
  },
  {
    path: '/clusters/*/-/pods',
    component: 'clusters/Pods',
  },
  {
    path: '/clusters/*/-/pods/:name',
    menuRender: false,
    component: 'clusters/Pod',
  },
  {
    path: '/clusters/*/-/pipelines',
    component: 'clusters/pipelines/History',
  },
  {
    path: '/clusters/*/-/pipelines/new',
    component: 'clusters/pipelines/New',
  },
  {
    path: '/clusters/*/-/pipelines/:id',
    component: 'clusters/pipelines/Detail',
  },
  {
    path: '/clusters/*/-/members',
    component: 'clusters/Member',
  },
  {
    path: '/clusters/*/-/webconsole',
    menuRender: false,
    component: 'clusters/Pods/Console',
  },
  {
    path: '/clusters/*/-/monitoring',
    component: 'clusters/Monitoring',
  },
  {
    path: '/clusters/*/-/tags',
    menuRender: false,
    component: 'clusters/Tag',
  },
  {
    path: '/clusters/*/-/admintags',
    menuRender: false,
    component: 'clusters/AdminTag',
  }
];

const adminRoutes = [
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
    path: '/admin/harbors/new',
    component: 'admin/Harbors/New'
  }, {
    path: '/admin/harbors/:id',
    component: 'admin/Harbors/Detail'
  }, {
    path: '/admin/harbors/:id/edit',
    component: 'admin/Harbors/Edit'
  }, {
    path: '/admin/environments/new',
    component: 'admin/Environments/New'
  }, {
    path: '/admin/environments/:id',
    component: 'admin/Environments/Detail'
  }, {
    path: '/admin/environments/:id/edit',
    component: 'admin/Environments/Edit'
  },
]

const templateRoutes = [
  {
    path: '/groups/*/-/templates',
    component: 'templates'
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

const allRoute = [];
allRoute.push(...routes);
allRoute.push(...groupRoutes);
allRoute.push(...applicationRoutes);
allRoute.push(...clusterRoutes);
allRoute.push(...adminRoutes);
allRoute.push(...templateRoutes);
// @ts-ignore
allRoute.push({
  path: '/*',
  component: 'Detail',
});

export default allRoute;
