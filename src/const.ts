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

export enum RunningTaskStep {
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
