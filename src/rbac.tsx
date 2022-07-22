import {useModel} from "@@/plugin-model/useModel";

const AnonymousRole = 'anonymous';
const AdminRole = 'administrator';
const AllowAll = '*';


// 资源
const Resource = {
  group: 'groups',
  application: 'applications',
  cluster: 'clusters',
  member: 'members',
  buildDeploy: 'builddeploy',
  pods: 'pods',
  deploy: 'deploy',
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
  resume: 'resume',
  promote: 'promote',
  transfer: 'transfer',
  oauthApplication: 'oauthapps',
  oauthClientSecret: 'clientsecret',
  regionselectors: 'regionselectors',
  template: 'templates',
  release: 'releases',
}

// 操作
const Action = {
  create: 'create',
  update: 'update',
  delete: 'delete',
  get: 'get',
}

// Permissions是当前用户的权限集合，一旦用户在具体资源下的role确认，各项操作是否允许也将被确认
// 字段说明：
// - resource：该操作的目标资源类型，其中create操作相关的资源类型，必须为子资源，即父资源/子资源的格式
// - action：该操作的具体动作
// - env：该操作被允许的环境列表
// - allowed：该操作是否被允许
// - allowedEnv：该操作在对应环境是否允许，目前只有createCluster使用，其他操作判断allowed字段即可
// 不受通用RBAC管控的例外情况：
// - 根group的创建只允许admin操作
// - member除create外的其他操作（update、delete）根据角色排序来控制
// - get操作只有涉及按钮触发的才做限制，其余前端暂时不做限制
const Permissions = {
  // 创建子group
  createGroup: {
    resource: `${Resource.group}/${Resource.group}`,
    action: Action.create,
    allowed: false,
  },
  // 删除子group
  deleteGroup: {
    resource: Resource.group,
    action: Action.delete,
    allowed: false,
  },
  // 更新子group
  updateGroup: {
    resource: Resource.group,
    action: Action.update,
    allowed: false,
  },
  // 转移应用
  TransferGroup: {
    resource: `${Resource.group}/${Resource.transfer}`,
    action: Action.update,
    allowed: true,
  },
  // 更新regionSelector
  setRegionSelector: {
    resource: `${Resource.group}/${Resource.regionselectors}`,
    action: Action.update,
    allowed: false,
  },
  // 创建应用
  createApplication: {
    resource: `${Resource.group}/${Resource.application}`,
    action: Action.create,
    allowed: false,
  },
  // 删除应用
  deleteApplication: {
    resource: Resource.application,
    action: Action.delete,
    allowed: false,
  },
  // 更新应用
  updateApplication: {
    resource: Resource.application,
    action: Action.update,
    allowed: false,
  },
  // 转移应用
  TransferApplication: {
    resource: `${Resource.application}/${Resource.transfer}`,
    action: Action.update,
    allowed: true,
  },
  // 创建集群
  createCluster: {
    resource: `${Resource.application}/${Resource.cluster}`,
    action: Action.create,
    env: new Array<string>(),
    allowed: false,
    allowedEnv: (env: string) => {
      return (env == '' && Permissions.createCluster.env.length > 0) ||
        Permissions.createCluster.env.includes(AllowAll) || Permissions.createCluster.env.includes(env)
    },
  },
  // 删除集群
  deleteCluster: {
    resource: Resource.cluster,
    action: Action.delete,
    allowed: false,
  },
  // 更新集群
  updateCluster: {
    resource: Resource.cluster,
    action: Action.update,
    allowed: false,
  },
  // 释放集群
  freeCluster: {
    resource: `${Resource.cluster}/${Resource.free}`,
    action: Action.create,
    allowed: false,
  },
  // 添加group member
  createGroupMember: {
    resource: `${Resource.group}/${Resource.member}`,
    action: Action.create,
    env: new Array<string>(),
    allowed: false,
  },
  // 添加application member
  createApplicationMember: {
    resource: `${Resource.application}/${Resource.member}`,
    action: Action.create,
    env: new Array<string>(),
    allowed: false,
  },
  // 添加cluster member
  createClusterMember: {
    resource: `${Resource.cluster}/${Resource.member}`,
    action: Action.create,
    env: new Array<string>(),
    allowed: false,
  },
  // 构建发布
  buildAndDeployCluster: {
    resource: `${Resource.cluster}/${Resource.buildDeploy}`,
    action: Action.create,
    allowed: false,
  },
  // 删除Pods
  deletePods: {
    resource: `${Resource.cluster}/${Resource.pods}`,
    action: Action.delete,
    allowed: false,
  },
  // 直接发布
  deployCluster: {
    resource: `${Resource.cluster}/${Resource.deploy}`,
    action: Action.create,
    allowed: false,
  },
  // 发布下一批次
  deployClusterNext: {
    resource: `${Resource.cluster}/${Resource.next}`,
    action: Action.create,
    allowed: false,
  },
  // 重启集群
  restartCluster: {
    resource: `${Resource.cluster}/${Resource.restart}`,
    action: Action.create,
    allowed: false,
  },
  // 回滚集群
  rollbackCluster: {
    resource: `${Resource.cluster}/${Resource.rollback}`,
    action: Action.create,
    allowed: false,
  },
  // 查看terminal
  createTerminal: {
    resource: `${Resource.cluster}/${Resource.shell}`,
    action: Action.get,
    allowed: false,
  },
  // 查看容器stdout日志
  getContainerLog: {
    resource: `${Resource.cluster}/${Resource.containerLog}`,
    action: Action.get,
    allowed: false,
  },
  // 查看集群状态
  getClusterStatus: {
    resource: `${Resource.cluster}/${Resource.status}`,
    action: Action.get,
    allowed: false,
  },
  // 集群上线
  onlineCluster: {
    resource: `${Resource.cluster}/${Resource.online}`,
    action: Action.create,
    allowed: false,
  },
  // 集群下线
  offlineCluster: {
    resource: `${Resource.cluster}/${Resource.offline}`,
    action: Action.create,
    allowed: false,
  },
  // 创建/修改/删除管理员标签
  updateTemplateSchemaTags: {
    resource: `${Resource.cluster}/${Resource.templateSchemaTags}`,
    action: Action.create,
    allowed: false,
  },
  // 创建/修改/删除标签
  updateTags: {
    resource: `${Resource.cluster}/${Resource.tags}`,
    action: Action.create,
    allowed: false,
  },
  // 查看events
  getEvents: {
    resource: `${Resource.cluster}/${Resource.events}`,
    action: Action.get,
    allowed: false,
  },
  // 集群暂停
  pauseCluster: {
    resource: `${Resource.cluster}/${Resource.pause}`,
    action: Action.create,
    allowed: false,
  },
  // 集群取消暂停
  resumeCluster: {
    resource: `${Resource.cluster}/${Resource.resume}`,
    action: Action.create,
    allowed: false,
  },
  // 集群发布剩余批次
  promoteCluster: {
    resource: `${Resource.cluster}/${Resource.promote}`,
    action: Action.create,
    allowed: false,
  },
  // 创建Oauth应用
  createOauthApplication: {
    resource: `${Resource.group}/${Resource.oauthApplication}`,
    action: Action.create,
    allowed: false,
  },
  // 删除Oauth应用
  deleteOauthApplication: {
    resource: `${Resource.group}/${Resource.oauthApplication}`,
    action: Action.delete,
    allowed: false,
  },
  // 更新Oauth应用
  updateOauthApplication: {
    resource: `${Resource.group}/${Resource.oauthApplication}`,
    action: Action.update,
    allowed: false,
  },
  // 创建Oauth应用ClientSecret
  createOauthClientSecret: {
    resource: `${Resource.oauthApplication}/${Resource.oauthClientSecret}`,
    action: Action.create,
    allowed: false,
  },
  // 删除Oauth应用ClientSecret
  deleteOauthClientSecret: {
    resource: `${Resource.oauthApplication}/${Resource.oauthClientSecret}`,
    action: Action.delete,
    allowed: false,
  },
  createTemplateMember: {
    resource: `${Resource.template}/${Resource.member}`,
    action: Action.create,
    allowed: false,
  } 
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
      Permissions[operation].env = [AllowAll];
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
  //      application/cluster: ['test']
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
          for (const scope of rule.scopes) {
            if (!rolePolicy[verb]) {
              rolePolicy[verb] = {};
            }
            if (!rolePolicy[verb][resource]) {
              rolePolicy[verb][resource] = [];
            }
            const parts = scope.split("/")
            const env = parts[0]
            rolePolicy[verb][resource] = rolePolicy[verb][resource].concat(env);
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
  })
  return;
}


// 返回role列表和排名，用于提供下拉列表以及进行比较
const GetRoleList = () => {
  const {initialState} = useModel('@@initialState');
  const roleRank = new Map();
  let roleList: string[] = [];

  roleRank.set(AdminRole, 0);
  for (let i = 0; i < initialState!.roles!.length; i++) {
    const role = initialState!.roles![i]
    roleRank.set(role.name, i)
    roleList = roleList.concat(role.name)
  }
  return {roleRank, roleList}
}

export default {
  AnonymousRole,
  AdminRole,
  GetRoleList,
  Permissions,
  AllowAll,
  RefreshPermissions,
};
