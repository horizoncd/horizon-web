export const routes = [
  {
    path: '/user/login',
    layout: false,
    component: 'user/Login',
  },
  {
    path: '/',
    menuRender: false,
    redirect: '/dashboard/groups',
  },
  {
    path: '/dashboard/groups',
    menuRender: false,
    component: 'dashboard/Groups',
  },
  {
    path: '/groups/new',
    menuRender: false,
    component: 'groups/New',
  },
  {
    path: '/applications/new',
    menuRender: false,
    component: 'applications/NewOrEdit',
  },
  {
    path: '/applications/edit',
    menuRender: false,
    component: 'applications/NewOrEdit',
  },
  {
    path: '/clusters/new',
    menuRender: false,
    component: 'clusters/NewOrEdit',
  },
  {
    path: '/clusters/edit',
    menuRender: false,
    component: 'clusters/NewOrEdit',
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
    path: '/groups/*/-/edit',
    component: 'groups/Edit',
  },
  {
    path: '/groups/*/-/activity',
    component: 'groups/Activity',
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
    path: '/applications/*/-/pipelines/:id',
    component: 'clusters/pipelines/Detail',
  },
];

const allRoute = [];
allRoute.push(...routes);
allRoute.push(...groupRoutes);
allRoute.push(...applicationRoutes);
// @ts-ignore
allRoute.push({
  path: '/*',
  component: 'Detail',
});

export default allRoute;
