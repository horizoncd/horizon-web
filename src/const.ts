export enum ResourceType {
  GROUP = 'group',
  APPLICATION = 'application',
  CLUSTER = 'cluster',
}

export enum Filters {
  template = 'template',
  templateRelease = 'template_release'
}

export enum PublishType {
  BUILD_DEPLOY = 'builddeploy',
  DEPLOY = 'deploy',
}

export enum MemberType {
  USER = 0,
  GROUP = 1,
}

export enum RunningTask {
  BUILD = 'build',
  DEPLOY = 'deploy',
  NONE = 'none',
}

export enum TaskStatus {
  RUNNING = 'Running',
  PENDING = 'Pending',
  SUCCEEDED = 'Succeeded',
  CANCELLED = 'Cancelled',
  FAILED = 'Failed',
}

export enum ClusterStatus {
  PROGRESSING = 'Progressing',
  HEALTHY = 'Healthy',
  SUSPENDED = 'Suspended',
  MANUALPAUSED = 'ManualPaused',
  DEGRADED = 'Degraded',
  NOT_HEALTHY = 'NotHealthy', // equals to Degraded
  NOTFOUND = 'NotFound',
  FREEING = 'Freeing',
  FREED = 'Freed',
  DELETING = 'Deleting',
}

const DeployTypeMap = new Map([
  ['builddeploy', '构建发布'],
  ['deploy', '直接发布'],
  ['rollback', '回滚'],
  ['restart', '重新启动'],
  ['freeCluster', '释放集群'],
  ['deleteCluster', '删除集群'],
])

const pro = 'pro'
const pre = 'pre'
const testDev = 'test_dev'
const env2MlogEnv = new Map<string, string>([
  ['online', pro],
  ['pre', pre],
  ['test', testDev],
  ['reg', testDev],
  ['perf', testDev],
  ['beta', testDev],
  ['dev', testDev],
])

export {
  DeployTypeMap,
  env2MlogEnv
}
