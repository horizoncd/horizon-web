import {
  SmileOutlined, LoadingOutlined, FrownOutlined,
} from '@ant-design/icons';
import { ReactNode } from 'react';
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

export enum BuildStatus {
  None, Failed, Running,
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

export const gitURLRegExp = /^(?:git|ssh|https?|git@[-\w.]+):(\/\/)?(.*?)(\.git)(\/?|#[-\d\w._]+?)$/;

const smile = <SmileOutlined />;
const loading = <LoadingOutlined />;
const frown = <FrownOutlined />;

export const taskStatus2Entity = new Map<TaskStatus, {
  icon: JSX.Element,
  buildTitle: ReactNode,
  deployTitle: ReactNode,
  stepStatus: 'wait' | 'process' | 'finish' | 'error',
}>([
  [TaskStatus.PENDING, {
    icon: loading,
    buildTitle: <Intl id="pages.cluster.status.building" />,
    deployTitle: <Intl id="pages.cluster.status.deploying" />,
    stepStatus: 'process',
  }],
  [TaskStatus.RUNNING, {
    icon: loading,
    buildTitle: <Intl id="pages.cluster.status.building" />,
    deployTitle: <Intl id="pages.cluster.status.deploying" />,
    stepStatus: 'process',
  }],
  [TaskStatus.SUCCEEDED, {
    icon: smile,
    buildTitle: <Intl id="pages.cluster.status.built" />,
    deployTitle: <Intl id="pages.cluster.status.deployed" />,
    stepStatus: 'finish',
  }],
  [TaskStatus.FAILED, {
    icon: frown,
    buildTitle: <span style={{ color: 'red' }}><Intl id="pages.cluster.status.buildFail" /></span>,
    deployTitle: <span style={{ color: 'red' }}><Intl id="pages.cluster.status.deployFail" /></span>,
    stepStatus: 'error',
  }],
]);

// application and cluster fields
export enum Priority {
  P0 = 'P0',
  P1 = 'P1',
  P2 = 'P2',
  P3 = 'P3',
}

export const Priorities = [Priority.P0, Priority.P1, Priority.P2, Priority.P3];

export enum ResourceKey {
  // base info
  NAME = 'name',
  DESCRIPTION = 'description',
  PRIORITY = 'priority',
  TAGS = 'tags',
  ENVIRONMENT = 'environment',
  REGION = 'region',
  EXPIRE_TIME = 'expireTime',

  // git info
  GIT_URL = 'url',
  GIT_SUB_FOLDER = 'subfolder',
  GIT_BRANCH = 'branch',
  GIT_REF_TYPE = 'refType',
  GIT_REF_VALUE = 'refValue',

  // image info
  IMAGE_URL = 'image',
}

export enum AppOrClusterType {
  GIT_IMPORT = 'gitImport',
  IMAGE_DEPLOY = 'imageDeploy',
}
