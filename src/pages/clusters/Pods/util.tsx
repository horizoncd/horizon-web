import {
  SmileOutlined, LoadingOutlined, FrownOutlined,
} from '@ant-design/icons';
import { ReactNode } from 'react';
import Intl from '@/components/Intl';
import { TaskStatus } from '@/const';
import utils from '@/utils';

const runningState = 'Running';
const onlineState = 'online';
const offlineState = 'offline';

const smile = <SmileOutlined />;
const loading = <LoadingOutlined />;
const frown = <FrownOutlined />;

export enum BuildStatus {
  None, Failed, Running,
}

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

// PodLifeCycleSchedule specifies whether pod has been scheduled
const PodLifeCycleSchedule = 'PodSchedule';
// PodLifeCycleInitialize specifies whether all init containers have finished
const PodLifeCycleInitialize = 'PodInitialize';
// PodLifeCycleContainerStartup specifies whether the container has passed its startup probe
const PodLifeCycleContainerStartup = 'ContainerStartup';
// PodLifeCycleContainerOnline specified whether the container has passed its postStart hook
const PodLifeCycleContainerOnline = 'ContainerOnline';
// PodLifeCycleHealthCheck specifies whether the container has passed its readiness probe
const PodLifeCycleHealthCheck = 'HealthCheck';
// PodLifeCycleContainerPreStop specifies whether the container is executing preStop hook
const PodLifeCycleContainerPreStop = 'PreStop';

const LifeCycleStatusSuccess = 'Success';
const LifeCycleStatusWaiting = 'Waiting';
const LifeCycleStatusRunning = 'Running';
const LifeCycleStatusAbnormal = 'Abnormal';
const PodErrCrashLoopBackOff = 'CrashLoopBackOff';

const PodScheduled = 'PodScheduled';
const PodInitialized = 'Initialized';
const PodConditionTrue = 'True';

// allContainersStarted determine if all containers have been started
function allContainersStarted(containerStatuses: Kubernetes.ContainerStatus[]):boolean {
  return containerStatuses.filter((item) => !item.started).length === 0;
}

// allContainersRunning determine if all containers running
function allContainersRunning(containerStatuses: Kubernetes.ContainerStatus[]):boolean {
  return containerStatuses.filter((item) => !item.state.running).length === 0;
}

// allContainersReady determine if all containers ready
function allContainersReady(containerStatuses: Kubernetes.ContainerStatus[]):boolean {
  return containerStatuses.filter((item) => !item.ready).length === 0;
}

// oneOfContainersCrash determine if one of containers crash
function oneOfContainersCrash(containerStatuses: Kubernetes.ContainerStatus[]):boolean {
  return containerStatuses.filter((item) => item.state.waiting && item.state.waiting.reason === PodErrCrashLoopBackOff).length !== 0;
}

// parsePodLifecycle parse pod lifecycle by pod status
function parsePodLifeCycle(pod: Kubernetes.Pod): CLUSTER.PodLifeCycle[] {
  let lifeCycle: CLUSTER.PodLifeCycle[] = [];
  // if DeletionTimestamp is set, pod is Terminating
  const { metadata, status } = pod;
  if (metadata.deletionTimestamp) {
    lifeCycle.push(
      {
        type: PodLifeCycleContainerPreStop,
        status: LifeCycleStatusRunning,
        message: '',
      },
    );
  } else {
    const conditionMap: Record<string, Kubernetes.Condition> = {};
    const schedule: CLUSTER.PodLifeCycle = {
      type: PodLifeCycleSchedule,
      status: LifeCycleStatusWaiting,
      message: '',
    };
    const initialize: CLUSTER.PodLifeCycle = {
      type: PodLifeCycleInitialize,
      status: LifeCycleStatusWaiting,
      message: '',
    };
    const containerStartup: CLUSTER.PodLifeCycle = {
      type: PodLifeCycleContainerStartup,
      status: LifeCycleStatusWaiting,
      message: '',
    };
    const containerOnline: CLUSTER.PodLifeCycle = {
      type: PodLifeCycleContainerOnline,
      status: LifeCycleStatusWaiting,
      message: '',
    };
    const healthCheck: CLUSTER.PodLifeCycle = {
      type: PodLifeCycleHealthCheck,
      status: LifeCycleStatusWaiting,
      message: '',
    };
    lifeCycle = [
      schedule,
      initialize,
      containerStartup,
      containerOnline,
      healthCheck,
    ];
    if (!status.containerStatuses || status.containerStatuses.length === 0) {
      return lifeCycle;
    }

    status.conditions.forEach((condition) => {
      conditionMap[condition.type] = condition;
    });

    if (PodScheduled in conditionMap) {
      const condition = conditionMap[PodScheduled];
      if (condition.status === PodConditionTrue) {
        schedule.status = LifeCycleStatusSuccess;
        schedule.completeTime = condition.lastTransitionTime;
        initialize.status = LifeCycleStatusRunning;
      } else if (condition.message !== '') {
        schedule.status = LifeCycleStatusAbnormal;
        schedule.message = condition.message;
      }
    } else {
      schedule.status = LifeCycleStatusWaiting;
    }

    if (PodScheduled in conditionMap) {
      const condition = conditionMap[PodInitialized];
      if (condition.status === PodConditionTrue) {
        initialize.status = LifeCycleStatusSuccess;
        initialize.completeTime = condition.lastTransitionTime;
        containerStartup.status = LifeCycleStatusRunning;
      }
    } else {
      initialize.status = LifeCycleStatusWaiting;
    }

    if (allContainersStarted(status.containerStatuses)) {
      containerStartup.status = LifeCycleStatusSuccess;
      containerOnline.status = LifeCycleStatusRunning;
    }

    if (allContainersRunning(status.containerStatuses)) {
      containerOnline.status = LifeCycleStatusSuccess;
      healthCheck.status = LifeCycleStatusRunning;
    }

    if (allContainersReady(status.containerStatuses)) {
      healthCheck.status = LifeCycleStatusSuccess;
    }

    // CrashLoopBackOff means rest items are abnormal
    if (oneOfContainersCrash(status.containerStatuses)) {
      lifeCycle = lifeCycle.map((item) => {
        const { status: itemStatus, ...restItem } = item;
        if (itemStatus === LifeCycleStatusRunning) {
          return { ...restItem, status: LifeCycleStatusAbnormal } as CLUSTER.PodLifeCycle;
        }
        return item;
      });
    }
  }

  return lifeCycle;
}

function getRevision(n: CLUSTER.ResourceNode) {
  if (n.info && n.info.length > 0) {
    const revision = n.info.filter((item) => item.name === 'Revision');
    if (revision.length > 0) {
      return revision[0].value;
    }
  }
  return '';
}

type Tree = {
  parent?: Tree,
  node : CLUSTER.ResourceNode,
  children: Tree[],
};

function genTree(data: CLUSTER.ResourceTree) {
  const roots: Tree[] = [];
  const visited: Record<string, Tree> = {};

  Object.keys(data.nodes).forEach((k) => {
    if (k in visited) {
      return;
    }
    let key = k;

    let preNode: Tree | undefined;

    while (true) {
      let root = visited[key];
      if (root === undefined) {
        root = {
          node: data.nodes[key],
          children: [],
        };
        visited[key] = root;
      }

      if (preNode !== undefined) {
        preNode.parent = root;
        root.children.push(preNode);
      }

      if (root.node.parentRefs && root.node.parentRefs.length !== 0) {
        key = root.node.parentRefs[0].uid;
        preNode = root;
      } else {
        roots.push(root);
        return;
      }
    }
  });
  return visited;
}

export const refreshPodsInfo = (data?: CLUSTER.ResourceTree) => {
  const podsMap: Record<string, CLUSTER.PodInTable[]> = {};
  const currentPods: CLUSTER.PodInTable[] = [];
  const healthyPods: CLUSTER.PodInTable[] = [];
  const notHealthyPods: CLUSTER.PodInTable[] = [];
  if (!data) {
    return {
      podsMap,
      currentPods,
      healthyPods,
      notHealthyPods,
      sortedKey: [],
    };
  }

  const { nodes } = data;

  const trees = genTree(data);

  function getPrefix(k: string) {
    let n = trees[k];
    let res = '';
    while (true) {
      if (res !== '') {
        res = `${n.node.name}/${res}`;
      } else {
        res = n.node.name;
      }
      if (n.parent) {
        n = n.parent;
      } else {
        return res;
      }
    }
  }

  const revisionSet = new Set<Tree>();

  Object.keys(nodes).forEach((uid: string) => {
    const node = nodes[uid];
    if (node.kind === 'Pod') {
      const n = trees[node.uid];
      if (n.parent) {
        revisionSet.add(n.parent);
      }
    }
  });

  const revisions = Array.from(revisionSet);
  const parents: Tree[] = [];

  revisions.forEach((revision) => {
    const pods = revision.children.filter((n) => n.node.kind === 'Pod');
    if (pods && pods.length > 0) {
      const podsInTable = pods.map((podTreeNode) => {
        const pod = podTreeNode.node;
        const {
          status, spec, metadata,
        } = pod.podDetail!;
        const { containers } = spec;
        const { namespace, creationTimestamp } = metadata;
        const {
          containerStatuses, phase, reason, message,
        } = status;

        let restartCount = 0;
        let onlineStatus = offlineState;
        if (containerStatuses && containerStatuses.length > 0) {
          restartCount = containerStatuses[0].restartCount;
          if (containerStatuses.length === containers.length) {
            onlineStatus = onlineState;
            containerStatuses.forEach(
              (containerStatus: any) => {
                if (!containerStatus.ready) {
                  onlineStatus = offlineState;
                }
              },
            );
          }
        }

        const podInTable: CLUSTER.PodInTable = {
          key: metadata.name,
          state: {
            state: phase,
            reason,
            message,
          },
          podName: metadata.name,
          createTime: utils.timeToLocal(creationTimestamp),
          ip: status.podIP,
          onlineStatus,
          lifeCycle: parsePodLifeCycle(pod.podDetail!),
          restartCount,
          containerName: containers[0].name,
          namespace,
          annotations: metadata.annotations,
          deletionTimestamp: metadata.deletionTimestamp,
          // @ts-ignore
          containers: spec.containers,
        };
        if (phase === runningState) {
          healthyPods.push(podInTable);
        } else {
          notHealthyPods.push(podInTable);
        }
        return podInTable;
      });
      podsMap[getPrefix(revision.node.uid)] = podsInTable;
      parents.push(revision);
    }
  });

  const sortedKey = parents.sort((a, b) => {
    const revisionA = getRevision(a.node);
    const revisionB = getRevision(b.node);
    // order by revision desc
    if (revisionA !== '' && revisionB !== '') {
      if (revisionA === revisionB) {
        // order by name desc
        return -a.node.name.localeCompare(b.node.name);
      }
      return -revisionA.localeCompare(revisionB);
    }
    if (revisionA !== '') {
      return 1;
    }
    if (revisionB !== '') {
      return -1;
    }
    // order by name desc
    return -a.node.name.localeCompare(b.node.name);
  }).map((n) => getPrefix(n.node.uid));

  return {
    podsMap,
    currentPods,
    healthyPods,
    notHealthyPods,
    sortedKey,
  };
};
