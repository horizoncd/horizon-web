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
    component: 'dashboard/groups',
  },
  {
    path: '/groups/new',
    menuRender: false,
    component: 'groups/New',
  },
  {
    path: '/applications/new',
    menuRender: false,
    component: 'applications/new',
  },
  {
    path: '/applications/edit',
    menuRender: false,
    component: 'applications/new',
  },
];

const groupRoutes = [
  {
    path: '/groups/*/-/members',
    component: 'groups/Members',
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
    component: 'applications/member',
  },
  {
    path: '/applications/*/-/clusters',
    component: 'applications/Clusters',
  },
];

const allRoute = [];
allRoute.push(...routes);
allRoute.push(...groupRoutes);
allRoute.push(...applicationRoutes);
// @ts-ignore
allRoute.push({
  path: '/*',
  component: 'detail',
});

export default allRoute;
