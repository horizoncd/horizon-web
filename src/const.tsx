import Intl from '@/components/Intl';

export enum ResourceType {
  GROUP = 'group',
  APPLICATION = 'application',
  CLUSTER = 'cluster',
  TEMPLATE = 'template',
  RELEASE = 'release',
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
  CREATING = 'Creating',
  PROGRESSING = 'Progressing',
  HEALTHY = 'Healthy',
  SUSPENDED = 'Suspended',
  MANUALPAUSED = 'ManualPaused',
  DEGRADED = 'Degraded',
  NOTHEALTHY = 'NotHealthy', // equals to Degraded
  NOTFOUND = 'NotFound',
  FREEING = 'Freeing',
  FREED = 'Freed',
  DELETING = 'Deleting',
}

const DeployTypeMap = new Map([
  ['builddeploy', <Intl id="pages.cluster.action.buildDeploy" />],
  ['deploy', <Intl id="pages.cluster.action.deploy" />],
  ['rollback', <Intl id="pages.cluster.action.rollback" />],
  ['restart', <Intl id="pages.cluster.action.restart" />],
]);

const pro = 'pro';
const pre = 'pre';
const testDev = 'test_dev';
const env2MlogEnv = new Map<string, string>([
  ['online', pro],
  ['pre', pre],
  ['test', testDev],
  ['reg', testDev],
  ['perf', testDev],
  ['beta', testDev],
  ['dev', testDev],
]);

export {
  DeployTypeMap,
  env2MlogEnv,
};

export const RedirectURL = `${window.location.protocol}//${window.location.host}/user/login/callback`;
export const IndexURL = `${window.location.protocol}//${window.location.host}`;
