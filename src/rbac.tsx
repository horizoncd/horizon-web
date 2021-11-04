import {useModel} from "@@/plugin-model/useModel";

const AnonymousRole = 'anonymous';
const AllowAll = '*';


// 资源
const Resource = {
  group: 'groups',
  application: 'applications',
  cluster: 'clusters',
  member: 'members',
}

// 操作
const Action = {
  create: 'create',
  update: 'update',
  delete: 'delete',
}

// Permissions是当前用户的权限集合，一旦用户在具体资源下的role确认，各项操作是否允许也将被确认
// 其中资源的get操作暂时不做限制，而member只有create操作被rbac所管控，其他操作（update、delete）根据角色排序来控制
// create操作相关的资源，必须为子资源，因此需要带上父资源/，我们只判断/即可
const Permissions = {
  createGroup: {
    resource: `/${Resource.group}`,
    action: Action.create,
    allowedEnv: new Array<string>(),
    allowed: false,
  },
  deleteGroup: {
    resource: Resource.group,
    action: Action.delete,
    allowedEnv: new Array<string>(),
    allowed: false,
  },
  updateGroup: {
    resource: Resource.group,
    action: Action.update,
    allowedEnv: new Array<string>(),
    allowed: false,
  },
  createApplication: {
    resource: `/${Resource.application}`,
    action: Action.create,
    allowedEnv: new Array<string>(),
    allowed: false,
  },
  deleteApplication: {
    resource: Resource.application,
    action: Action.delete,
    allowedEnv: new Array<string>(),
    allowed: false,
  },
  updateApplication: {
    resource: Resource.application,
    action: Action.update,
    allowedEnv: new Array<string>(),
    allowed: false,
  },
  createCluster: {
    resource: `/${Resource.cluster}`,
    action: Action.create,
    allowedEnv: new Array<string>(),
    allowed: false,
  },
  deleteCluster: {
    resource: Resource.cluster,
    action: Action.delete,
    allowedEnv: new Array<string>(),
    allowed: false,
  },
  updateCluster: {
    resource: Resource.cluster,
    action: Action.update,
    allowedEnv: new Array<string>(),
    allowed: false,
  },
  createMember: {
    resource: `/${Resource.member}`,
    action: Action.create,
    allowedEnv: new Array<string>(),
    allowed: false,
  },
}


// RefreshPermissions用于基于roles接口返回结果和用户自身的role刷新Permissions
// roles接口返回示例：
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
      Permissions[operation].allowedEnv = [AllowAll];
    })
    return;
  }
  if (currentUser.role === AnonymousRole) {
    return;
  }
  // rolePolicy用于记录自身角色被允许的操作、资源、环境，其中 resource/subResource 和 subResource 是有区别的，前者只对 create 操作生效，后者对除 create 之外的操作生效
  // rolePolicy示例：
  // {
  //    create: {
  //      /application: ['test']
  //    },
  //    update: {
  //      applications: ['*']
  //    }
  // }
  const rolePolicy = {};
  for (const role of roles) {
    if (role.name !== currentUser.role) {
      continue;
    }
    for (const rule of role.rules) {
      for (const verb of rule.verbs) {
        for (const resource of rule.resources) {
          for (const env of rule.scopes) {
            if (!rolePolicy[verb]) {
              rolePolicy[verb] = {};
            }
            let resourceSuffix = resource
            const index = resource.lastIndexOf('/');
            if (index !== -1) {
              resourceSuffix = resource.slice(index);
            }
            if (!rolePolicy[verb][resourceSuffix]) {
              rolePolicy[verb][resourceSuffix] = [];
            }
            const envPrefix = env.replaceAll('/*', '');
            rolePolicy[verb][resourceSuffix] = rolePolicy[verb][resourceSuffix].concat(envPrefix);
          }
        }
      }
    }
  }

  // 遍历Permissions的每个属性，若 action 和 resource 在 rolePolicy 中被记录，则认为对应操作被允许
  Object.keys(Permissions).forEach((operation) => {
    const action = Permissions[operation].action;
    const resource = Permissions[operation].resource;
    // 清空原有的权限
    Permissions[operation].allowed = false;
    Permissions[operation].allowedEnv = [];
    // [action][resource] or [action][*]
    if (action in rolePolicy) {
      if (resource in rolePolicy[action]) {
        Permissions[operation].allowed = true;
        Permissions[operation].allowedEnv = rolePolicy[action][resource];
      }
      if (AllowAll in rolePolicy[action]) {
        Permissions[operation].allowed = true;
        Permissions[operation].allowedEnv = rolePolicy[action][AllowAll];
      }
    }
    // [*][resource] or [*][*]
    if (AllowAll in rolePolicy) {
      if (resource in rolePolicy[AllowAll]) {
        Permissions[operation].allowed = true;
        Permissions[operation].allowedEnv = rolePolicy[AllowAll][resource];
      }
      if (AllowAll in rolePolicy[AllowAll]) {
        Permissions[operation].allowed = true;
        Permissions[operation].allowedEnv = rolePolicy[AllowAll][AllowAll];
      }
    }
  })
  return;
}


// 返回role列表和排名，用于提供下拉列表以及进行比较
const GetRoleList = () => {
  const {initialState} = useModel('@@initialState');
  const roleRank = new Map();
  let roleList: string[] = [];
  for (let i = 0; i < initialState!.roles!.length; i++) {
    const role = initialState!.roles![i]
    roleRank.set(role.name, i)
    roleList = roleList.concat(role.name)
  }
  return {roleRank, roleList}
}

export default {
  AnonymousRole,
  GetRoleList,
  Permissions,
  AllowAll,
  RefreshPermissions,
};
