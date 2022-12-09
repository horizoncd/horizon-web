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

export const refreshPodsInfo = (data?: CLUSTER.ClusterStatusV2) => {
  const podsMap: Record<string, CLUSTER.PodInTable[]> = {};
  let currentPods: CLUSTER.PodInTable[] = [];
  const healthyPods: CLUSTER.PodInTable[] = [];
  const notHealthyPods: CLUSTER.PodInTable[] = [];
  const images = new Set<string>();
  if (!data) {
    return {
      podsMap,
      currentPods,
      healthyPods,
      notHealthyPods,
      images,
    };
  }

  const { revision, versions } = data;
  if (versions) {
    Object.keys(versions).forEach((version) => {
      const versionObj = versions[version];
      const { pods } = versionObj;
      if (pods) {
        const podsInTable = Object.keys(pods).map((podName) => {
          const podObj = versionObj.pods[podName];
          const { status, spec, metadata } = podObj;
          const { containers, initContainers } = spec;
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
            key: podName,
            state: {
              state: phase,
              reason,
              message,
            },
            podName,
            createTime: utils.timeToLocal(creationTimestamp),
            ip: status.podIP,
            onlineStatus,
            restartCount,
            containerName: containers[0].name,
            namespace,
            events: status.events,
            lifeCycle: status.lifeCycle,
            deletionTimestamp: podObj.deletionTimestamp,
            annotations: podObj.metadata.annotations,
            // @ts-ignore
            containers: podObj.spec.containers,
          };
          if (phase === runningState) {
            healthyPods.push(podInTable);
          } else {
            notHealthyPods.push(podInTable);
          }
          if (version === revision) {
            if (initContainers) {
              initContainers.forEach((item) => images.add(item.image));
            }
            containers.forEach((item) => images.add(item.image));
          }
          return podInTable;
        });
        if (version === revision) {
          currentPods = podsInTable;
        } else {
          podsMap[version] = podsInTable;
        }
      }
    });
  }

  return {
    podsMap,
    currentPods,
    healthyPods,
    notHealthyPods,
    images,
  };
};
