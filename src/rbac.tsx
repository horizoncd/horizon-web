import { useModel } from '@@/plugin-model/useModel';

const AnonymousRole = 'anonymous';
const AdminRole = 'administrator';
const AllowAll = '*';

const Resource = {
  group: 'groups',
  application: 'applications',
  instance: 'clusters',
  member: 'members',
  buildDeploy: 'builddeploy',
  pods: 'pods',
  deploy: 'deploy',
  deployAll: 'deployall',
  diff: 'diff',
  next: 'next',
  restart: 'restart',
  rollback: 'rollback',
  status: 'status',
  pipelines: 'pipelines',
  terminal: 'terminal',
  containerLog: 'containerlog',
  online: 'online',
  offline: 'offline',
  free: 'free',
  templateSchemaTags: 'templateschematags',
  tags: 'tags',
  shell: 'shell',
  events: 'events',
  pause: 'pause',
  action: 'action',
  resume: 'resume',
  promote: 'promote',
  transfer: 'transfer',
  oauthApplication: 'oauthapps',
  oauthClientSecret: 'clientsecret',
  regionselectors: 'regionselectors',
  template: 'templates',
  templaterelease: 'templatereleases',
  accesstokens: 'accesstokens',
  personalaccesstokens: 'personalaccesstokens',
  webhooks: 'webhooks',
};

const Action = {
  create: 'create',
  update: 'update',
  delete: 'delete',
  get: 'get',
};

const Permissions = {
  createGroup: {
    resource: `${Resource.group}/${Resource.group}`,
    action: Action.create,
    allowed: false,
  },
  deleteGroup: {
    resource: Resource.group,
    action: Action.delete,
    allowed: false,
  },
  updateGroup: {
    resource: Resource.group,
    action: Action.update,
    allowed: false,
  },
  TransferGroup: {
    resource: `${Resource.group}/${Resource.transfer}`,
    action: Action.update,
    allowed: true,
  },
  setRegionSelector: {
    resource: `${Resource.group}/${Resource.regionselectors}`,
    action: Action.update,
    allowed: false,
  },
  createApplication: {
    resource: `${Resource.group}/${Resource.application}`,
    action: Action.create,
    allowed: false,
  },
  deleteApplication: {
    resource: Resource.application,
    action: Action.delete,
    allowed: false,
  },
  updateApplication: {
    resource: Resource.application,
    action: Action.update,
    allowed: false,
  },
  updateApplicationTags: {
    resource: `${Resource.application}/${Resource.tags}`,
    action: Action.create,
    allowed: false,
  },
  TransferApplication: {
    resource: `${Resource.application}/${Resource.transfer}`,
    action: Action.update,
    allowed: true,
  },
  createCluster: {
    resource: `${Resource.application}/${Resource.instance}`,
    action: Action.create,
    env: new Array<string>(),
    allowed: false,
    allowedEnv: (env: string) => (env === '' && Permissions.createCluster.env.length > 0)
      || Permissions.createCluster.env.includes(AllowAll) || Permissions.createCluster.env.includes(env),
  },
  deleteCluster: {
    resource: Resource.instance,
    action: Action.delete,
    allowed: false,
  },
  updateCluster: {
    resource: Resource.instance,
    action: Action.update,
    allowed: false,
  },
  upgradeCluster: {
    resource: Resource.instance,
    action: Action.update,
    allowed: false,
  },
  freeCluster: {
    resource: `${Resource.instance}/${Resource.free}`,
    action: Action.create,
    allowed: false,
  },
  createGroupMember: {
    resource: `${Resource.group}/${Resource.member}`,
    action: Action.create,
    env: new Array<string>(),
    allowed: false,
  },
  createApplicationMember: {
    resource: `${Resource.application}/${Resource.member}`,
    action: Action.create,
    env: new Array<string>(),
    allowed: false,
  },
  createClusterMember: {
    resource: `${Resource.instance}/${Resource.member}`,
    action: Action.create,
    env: new Array<string>(),
    allowed: false,
  },
  buildAndDeployCluster: {
    resource: `${Resource.instance}/${Resource.buildDeploy}`,
    action: Action.create,
    allowed: false,
  },
  deletePods: {
    resource: `${Resource.instance}/${Resource.pods}`,
    action: Action.delete,
    allowed: false,
  },
  deployCluster: {
    resource: `${Resource.instance}/${Resource.deploy}`,
    action: Action.create,
    allowed: false,
  },
  deployClusterAll: {
    resource: `${Resource.instance}/${Resource.deployAll}`,
    action: Action.create,
    allowed: false,
  },
  deployClusterNext: {
    resource: `${Resource.instance}/${Resource.next}`,
    action: Action.create,
    allowed: false,
  },
  restartCluster: {
    resource: `${Resource.instance}/${Resource.restart}`,
    action: Action.create,
    allowed: false,
  },
  rollbackCluster: {
    resource: `${Resource.instance}/${Resource.rollback}`,
    action: Action.create,
    allowed: false,
  },
  createTerminal: {
    resource: `${Resource.instance}/${Resource.shell}`,
    action: Action.get,
    allowed: false,
  },
  getContainerLog: {
    resource: `${Resource.instance}/${Resource.containerLog}`,
    action: Action.get,
    allowed: false,
  },
  getClusterStatus: {
    resource: `${Resource.instance}/${Resource.status}`,
    action: Action.get,
    allowed: false,
  },
  onlineCluster: {
    resource: `${Resource.instance}/${Resource.online}`,
    action: Action.create,
    allowed: false,
  },
  offlineCluster: {
    resource: `${Resource.instance}/${Resource.offline}`,
    action: Action.create,
    allowed: false,
  },
  updateTemplateSchemaTags: {
    resource: `${Resource.instance}/${Resource.templateSchemaTags}`,
    action: Action.create,
    allowed: false,
  },
  updateClusterTags: {
    resource: `${Resource.instance}/${Resource.tags}`,
    action: Action.create,
    allowed: false,
  },
  getEvents: {
    resource: `${Resource.instance}/${Resource.events}`,
    action: Action.get,
    allowed: false,
  },
  executeAction: {
    resource: `${Resource.instance}/${Resource.action}`,
    action: Action.create,
    allowed: false,
  },
  pauseCluster: {
    resource: `${Resource.instance}/${Resource.pause}`,
    action: Action.create,
    allowed: false,
  },
  resumeCluster: {
    resource: `${Resource.instance}/${Resource.resume}`,
    action: Action.create,
    allowed: false,
  },
  promoteCluster: {
    resource: `${Resource.instance}/${Resource.promote}`,
    action: Action.create,
    allowed: false,
  },
  createOauthApplication: {
    resource: `${Resource.group}/${Resource.oauthApplication}`,
    action: Action.create,
    allowed: false,
  },
  deleteOauthApplication: {
    resource: `${Resource.group}/${Resource.oauthApplication}`,
    action: Action.delete,
    allowed: false,
  },
  updateOauthApplication: {
    resource: `${Resource.group}/${Resource.oauthApplication}`,
    action: Action.update,
    allowed: false,
  },
  createOauthClientSecret: {
    resource: `${Resource.oauthApplication}/${Resource.oauthClientSecret}`,
    action: Action.create,
    allowed: false,
  },
  deleteOauthClientSecret: {
    resource: `${Resource.oauthApplication}/${Resource.oauthClientSecret}`,
    action: Action.delete,
    allowed: false,
  },
  createTemplate: {
    resource: `${Resource.group}/${Resource.template}`,
    action: Action.create,
    allowed: false,
  },
  updateTemplate: {
    resource: `${Resource.template}`,
    action: Action.update,
    allowed: false,
  },
  deleteTemplate: {
    resource: `${Resource.template}`,
    action: Action.delete,
    allowed: false,
  },
  syncRelease: {
    resource: `${Resource.templaterelease}/sync`,
    action: Action.create,
    allowed: false,
  },
  updateRelease: {
    resource: `${Resource.templaterelease}`,
    action: Action.update,
    allowed: false,
  },
  deleteRelease: {
    resource: `${Resource.templaterelease}`,
    action: Action.delete,
    allowed: false,
  },
  createRelease: {
    resource: `${Resource.template}/releases`,
    action: Action.create,
    allowed: false,
  },
  createTemplateMember: {
    resource: `${Resource.template}/${Resource.member}`,
    action: Action.create,
    allowed: false,
  },
  createGroupAccessTokens: {
    resource: `${Resource.group}/${Resource.accesstokens}`,
    action: Action.create,
    allowed: false,
  },
  createApplicationAccessTokens: {
    resource: `${Resource.application}/${Resource.accesstokens}`,
    action: Action.create,
    allowed: false,
  },
  createClusterAccessTokens: {
    resource: `${Resource.instance}/${Resource.accesstokens}`,
    action: Action.create,
    allowed: false,
  },
  createPersonalAccessTokens: {
    resource: `${Resource.personalaccesstokens}`,
    action: Action.create,
    allowed: false,
  },
  deleteGroupAccessTokens: {
    resource: `${Resource.group}/${Resource.accesstokens}`,
    action: Action.delete,
    allowed: false,
  },
  deleteApplicationAccessTokens: {
    resource: `${Resource.application}/${Resource.accesstokens}`,
    action: Action.delete,
    allowed: false,
  },
  deleteClusterAccessTokens: {
    resource: `${Resource.instance}/${Resource.accesstokens}`,
    action: Action.delete,
    allowed: false,
  },
  listClusterWebhooks: {
    resource: `${Resource.instance}/${Resource.webhooks}`,
    action: Action.get,
    allowed: false,
  },
  runPipelineRun: {
    resource: `${Resource.pipelines}/run`,
    action: Action.create,
    allowed: false,
  },
  forceReadyPipelineRun: {
    resource: `${Resource.pipelines}/forceready`,
    action: Action.create,
    allowed: false,
  },
  cancelPipelineRun: {
    resource: `${Resource.pipelines}/cancel`,
    action: Action.create,
    allowed: false,
  },
};

// roles response example：
// {
//   "name": "guest",
//   "rules": [
//     {
//       "verbs": [
//         "create",
//         "get",
//         "update"
//       ],
//       "apiGroups": [
//         "core"
//       ],
//       "resources": [
//         "applications/clusters"
//       ],
//       "scopes": [
//         "test/*",
//         "reg/*",
//         "perf/*",
//         "pre/*"
//       ],
//       "nonResourceURLs": null
//     }
//   ]
// }
const RefreshPermissions = (roles: API.Role[], currentUser: API.CurrentUser) => {
  if (currentUser.isAdmin) {
    Object.keys(Permissions).forEach((operation) => {
      Permissions[operation].allowed = true;
      Permissions[operation].env = [AllowAll];
    });
    return;
  }
  if (currentUser.role === AnonymousRole) {
    return;
  }
  // rolePolicy example：
  // {
  //    create: {
  //      application/cluster: ['test']
  //    },
  //    update: {
  //      applications: ['*']
  //    }
  // }
  const rolePolicy = {};
  roles.forEach((role) => {
    if (role.name !== currentUser.role) {
      return;
    }
    role.rules.forEach((rule) => {
      rule.verbs.forEach((verb) => {
        rule.resources.forEach((resource) => {
          rule.scopes.forEach((scope) => {
            if (!rolePolicy[verb]) {
              rolePolicy[verb] = {};
            }
            if (!rolePolicy[verb][resource]) {
              rolePolicy[verb][resource] = [];
            }
            const parts = scope.split('/');
            const env = parts[0];
            rolePolicy[verb][resource] = rolePolicy[verb][resource].concat(env);
          });
        });
      });
    });
  });

  Object.keys(Permissions).forEach((operation) => {
    const { action } = Permissions[operation];
    const { resource } = Permissions[operation];

    Permissions[operation].allowed = false;
    Permissions[operation].env = [];
    // [action][resource] or [action][*]
    if (action in rolePolicy) {
      if (resource in rolePolicy[action]) {
        Permissions[operation].allowed = true;
        Permissions[operation].env = rolePolicy[action][resource];
      }
      if (AllowAll in rolePolicy[action]) {
        Permissions[operation].allowed = true;
        Permissions[operation].env = rolePolicy[action][AllowAll];
      }
    }
    // [*][resource] or [*][*]
    if (AllowAll in rolePolicy) {
      if (resource in rolePolicy[AllowAll]) {
        Permissions[operation].allowed = true;
        Permissions[operation].env = rolePolicy[AllowAll][resource];
      }
      if (AllowAll in rolePolicy[AllowAll]) {
        Permissions[operation].allowed = true;
        Permissions[operation].env = rolePolicy[AllowAll][AllowAll];
      }
    }
  });
};

const GetRoleList = () => {
  const { initialState } = useModel('@@initialState');
  const roleRank = new Map();
  let roleList: string[] = [];

  roleRank.set(AdminRole, 0);
  for (let i = 0; i < initialState!.roles!.length; i += 1) {
    const role = initialState!.roles![i];
    roleRank.set(role.name, i);
    roleList = roleList.concat(role.name);
  }
  return { roleRank, roleList };
};

export default {
  AnonymousRole,
  AdminRole,
  GetRoleList,
  Permissions,
  AllowAll,
  RefreshPermissions,
};
