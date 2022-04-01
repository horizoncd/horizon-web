export const routes = [
  {
    path: '/user/login',
    layout: false,
    component: 'user/Login',
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
  },{
    path: '/groups/*/-/settings/advance',
    component: 'groups/config/Advance'
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

const allRoute = [];
allRoute.push(...routes);
allRoute.push(...groupRoutes);
allRoute.push(...applicationRoutes);
allRoute.push(...clusterRoutes);
// @ts-ignore
allRoute.push({
  path: '/*',
  component: 'Detail',
});

export default allRoute;
