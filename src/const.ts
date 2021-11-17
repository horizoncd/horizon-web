export enum ResourceType {
  GROUP = 'group',
  APPLICATION = 'application',
  CLUSTER = 'cluster',
}

export enum PublishType {
  BUILD_DEPLOY = 'buildDeploy',
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
  DEGRADED = 'Degraded',
  NOTFOUND = 'NotFound',
}

const DeployTypeMap = new Map([
  ['builddeploy', '构建发布'],
  ['deploy', '直接发布'],
  ['rollback', '回滚'],
  ['restart', '重新启动'],
])

export {
  DeployTypeMap
}
