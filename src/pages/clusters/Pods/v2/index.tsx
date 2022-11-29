import {
  Button, Col, Dropdown, Menu, Modal, Row, Steps, Tabs, Tooltip,
} from 'antd';
import styled from 'styled-components';
import { useIntl } from '@@/plugin-locale/localeExports';
import { useModel } from '@@/plugin-model/useModel';
import { useRequest } from '@@/plugin-request/request';
import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  CopyOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
  FrownOutlined,
  FullscreenOutlined,
  HourglassOutlined,
  LoadingOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import { history } from 'umi';
import { stringify } from 'querystring';
import copy from 'copy-to-clipboard';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import PodsTable from '../PodsTable';
import {
  deleteCluster,
  freeCluster,
  getClusterV2,
  getClusterStatus,
  getPipelines,
  next,
  pause,
  promote,
  restart,
  resume,
} from '@/services/clusters/clusters';
import HSteps from '@/components/HSteps';
import {
  ClusterStatus, PublishType, RunningTask, TaskStatus,
} from '@/const';
import styles from '../index.less';
import { cancelPipeline, queryPipelineLog } from '@/services/pipelineruns/pipelineruns';
import CodeEditor from '@/components/CodeEditor';
import type { Param } from '@/components/DetailCard';
import DetailCard from '@/components/DetailCard';
import Utils from '@/utils';
import { StatusComponent, isRestrictedStatus } from '@/components/State';
import RBAC from '@/rbac';
import { queryEnvironments } from '@/services/environments/environments';
import { queryRegions } from '@/services/applications/applications';
import FullscreenModal from '@/components/FullscreenModal';
import Intl from '@/components/Intl';

const { TabPane } = Tabs;
const { Step } = Steps;
const smile = <SmileOutlined />;
const loading = <LoadingOutlined />;
const frown = <FrownOutlined />;
const waiting = <HourglassOutlined />;

const taskStatus2Entity = new Map<TaskStatus, {
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

function DeployStep({
  index, total, replicas, statusData,
}: { index: number, total: number, replicas: string[], statusData: CLUSTER.ClusterStatus }) {
  const intl = useIntl();
  const s = [];
  for (let i = 0; i < total; i += 1) {
    s.push({
      title: intl.formatMessage({ id: 'pages.pods.step' }, { index: i + 1 }),
    });
  }
  return (
    <Steps current={index}>
      {s.map((item, idx) => {
        let icon;
        if (idx < index) {
          icon = smile;
        } else if (idx === index) {
          if (statusData?.clusterStatus.status === ClusterStatus.SUSPENDED) {
            icon = waiting;
          } else {
            icon = loading;
          }
        } else {
          icon = waiting;
        }
        return (
          <Step
            key={item.title}
            title={(
              <span>
                {item.title}
                <br />
                {replicas[idx]}
                {' '}
                {intl.formatMessage({ id: 'pages.pods.replica' })}
              </span>
              )}
            icon={icon}
          />
        );
      })}
    </Steps>
  );
}

interface DeployPageProps {
  step: {
    index: number,
    total: number,
    replicas: string[]
  },
  onNext: () => void,
  onPromote: () => void,
  onPause: () => void,
  onResume: () => void,
  onCancelDeploy: () => void,
  status: CLUSTER.ClusterStatus,
  nextStepString: string
}

function DeployPage({
  step, onNext, onPause, onResume, onPromote, onCancelDeploy, status, nextStepString,
}: DeployPageProps) {
  const intl = useIntl();
  const { index, total, replicas } = step;
  return (
    <div title={intl.formatMessage({ id: 'pages.pods.deployStep' })}>
      <DeployStep index={index} total={total} replicas={replicas} statusData={status} />
      <div style={{ textAlign: 'center' }}>
        {
        status.clusterStatus.manualPaused ? (
          <Button
            type="primary"
            disabled={!status.clusterStatus.manualPaused || !RBAC.Permissions.resumeCluster.allowed}
            style={{ margin: '0 8px' }}
            onClick={onResume}
          >
            {intl.formatMessage({ id: 'pages.pods.unpause' })}
          </Button>
        ) : (
          <Button
            type="primary"
            disabled={status.clusterStatus.manualPaused
                            || status.clusterStatus.status === ClusterStatus.SUSPENDED
                            || !RBAC.Permissions.pauseCluster.allowed}
            style={{ margin: '0 8px' }}
            onClick={onPause}
          >
            {intl.formatMessage({ id: 'pages.pods.manualPause' })}
          </Button>
        )
      }

        <Button
          type="primary"
          disabled={
          !RBAC.Permissions.deployClusterNext.allowed
                || status.clusterStatus.status !== ClusterStatus.SUSPENDED
                || status.clusterStatus.manualPaused
        }
          style={{ margin: '0 8px' }}
          onClick={onNext}
        >
          {nextStepString}
        </Button>
        <Button
          type="primary"
          disabled={
          !RBAC.Permissions.promoteCluster.allowed
                || status.clusterStatus.status !== ClusterStatus.SUSPENDED
                || status.clusterStatus.manualPaused
        }
          style={{ margin: '0 8px' }}
          onClick={onPromote}
        >
          {intl.formatMessage({ id: 'pages.pods.deployAll' })}
        </Button>
        <Button
          danger
          disabled={
          !RBAC.Permissions.rollbackCluster.allowed
                || !RBAC.Permissions.freeCluster.allowed
        }
          style={{ margin: '0 8px' }}
          onClick={onCancelDeploy}
        >
          {intl.formatMessage({ id: 'pages.pods.deployCancel' })}
        </Button>
      </div>
    </div>
  );
}

const DefaultText = styled.span`
margin: 0 0 6px 5px;
word-break: break-all;
`;
const AlertText = styled.div`
color: var(--red-500, #dd2b0e);
margin: 0 0 6px 5px;
word-break: break-all;
`;

const DurationDisplay = (props: { seconds: number }) => {
  const { seconds } = props;
  const intl = useIntl();

  let day = Math.floor(seconds / 3600 / 24);
  let hour = Math.round((seconds / 3600) % 24);
  if (hour === 24) {
    day += 1;
    hour = 0;
  }
  if (day >= 1) {
    const ttlText = hour === 0
      ? intl.formatMessage({ id: 'pages.common.time.dayHour' }, { day, hour })
      : intl.formatMessage({ id: 'pages.common.time.day' }, { day });
    return (
      <DefaultText>{ttlText}</DefaultText>
    );
  }
  return (
    <AlertText>{intl.formatMessage({ id: 'pages.common.time.hour' }, { hour })}</AlertText>
  );
};

const pollingInterval = 6000;
const pendingState = 'pending';
const runningState = 'running';
const onlineState = 'online';
const offlineState = 'offline';

export default () => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const { successAlert, errorAlert } = useModel('alert');
  const { id, fullPath, parentID } = initialState!.resource;
  const [current, setCurrent] = useState(0);
  const [freeAlerted, setFreeAlerted] = useState(true);
  const [userClickedCurrent, setUserClickedCurrent] = useState(-1);
  const [stepStatus, setStepStatus] = useState<'wait' | 'process' | 'finish' | 'error'>('wait');
  const [env2DisplayName, setEnv2DisplayName] = useState<Map<string, string>>();
  const [region2DisplayName, setRegion2DisplayName] = useState<Map<string, string>>();
  const [fullscreen, setFullscreen] = useState(false);

  const { data: cluster } = useRequest(() => getClusterV2(id), {});

  const { data: envs } = useRequest(queryEnvironments, {
    onSuccess: () => {
      const e = new Map<string, string>();
      envs!.forEach((item) => e.set(item.name, item.displayName));
      setEnv2DisplayName(e);
    },
  });
  const applicationID = parentID;
  const { data: regions } = useRequest(() => queryRegions(applicationID, cluster!.scope.environment), {
    onSuccess: () => {
      const e = new Map<string, string>();
      regions!.forEach((item) => e.set(item.name, item.displayName));
      setRegion2DisplayName(e);
    },
    ready: !!cluster,
  });

  const inPublishing = (statusData?: CLUSTER.ClusterStatus) => {
    const taskStatus = statusData?.runningTask.taskStatus as TaskStatus;
    // 2021.12.15 应用迁移到Horizon后，latestPipelinerun为null
    return taskStatus === TaskStatus.RUNNING || taskStatus === TaskStatus.PENDING || taskStatus === TaskStatus.FAILED;
  };

  const canCancelPublish = (statusData?: CLUSTER.ClusterStatus) => {
    const taskStatus = statusData?.runningTask.taskStatus as TaskStatus;
    const task = statusData?.runningTask.task as RunningTask;
    return task === RunningTask.BUILD && (taskStatus === TaskStatus.RUNNING || taskStatus === TaskStatus.PENDING);
  };

  const { data: buildLog, run: refreshLog } = useRequest((pID) => queryPipelineLog(pID), {
    formatResult: (res) => res,
    manual: true,
  });

  const [steps, setSteps] = useState<{
    title: ReactNode,
    icon: JSX.Element
  }[]>([
    {
      title: intl.formatMessage({ id: 'pages.cluster.status.toBuild' }),
      icon: waiting,
    },
    {
      title: intl.formatMessage({ id: 'pages.cluster.status.toDeploy' }),
      icon: waiting,
    },
  ]);

  const refreshPodsInfo = (data?: CLUSTER.ClusterStatus) => {
    const oldPods: CLUSTER.PodInTable[] = [];
    const newPods: CLUSTER.PodInTable[] = [];
    const healthyPods: CLUSTER.PodInTable[] = [];
    const notHealthyPods: CLUSTER.PodInTable[] = [];
    const images = new Set<string>();
    if (!data) {
      return {
        newPods,
        oldPods,
        healthyPods,
        notHealthyPods,
        images,
      };
    }

    const { podTemplateHash, versions } = data.clusterStatus;
    if (versions) {
      Object.keys(versions).forEach((version) => {
        const versionObj = versions[version];
        const { pods } = versionObj;
        if (pods) {
          Object.keys(pods).forEach((podName) => {
            const podObj = versionObj.pods[podName];
            const { status, spec, metadata } = podObj;
            const { containers, initContainers } = spec;
            const { namespace, creationTimestamp } = metadata;
            const { containerStatuses } = status;
            const state = {
              state: pendingState,
              reason: '',
              message: '',
            };
            let restartCount = 0;
            let onlineStatus = offlineState;
            if (containerStatuses && containerStatuses.length > 0) {
              Object.assign(state, containerStatuses[0].state);

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
              podName,
              state,
              createTime: Utils.timeToLocal(creationTimestamp),
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
            if (state.state === runningState) {
              healthyPods.push(podInTable);
            } else {
              notHealthyPods.push(podInTable);
            }
            if (podTemplateHash === version) {
              newPods.push(podInTable);
              if (initContainers) {
                initContainers.forEach((item) => images.add(item.image));
              }
              containers.forEach((item) => images.add(item.image));
            } else {
              oldPods.push(podInTable);
            }
            return podInTable;
          });
        }
      });
    }

    return {
      newPods,
      oldPods,
      healthyPods,
      notHealthyPods,
      images,
    };
  };
  const { data: statusData, run: refreshStatus } = useRequest(() => getClusterStatus(id), {
    pollingInterval,
    onSuccess: () => {
      if (statusData?.clusterStatus.status === ClusterStatus.FREED) {
        if (freeAlerted) {
          successAlert(intl.formatMessage({ id: 'pages.message.cluster.free.hint' }));
          setFreeAlerted(false);
        }
      }
      if (inPublishing(statusData)) {
        const { latestPipelinerun, clusterStatus } = statusData!;
        const { task, taskStatus } = statusData!.runningTask;

        const ttStatus = taskStatus as TaskStatus;
        const entity = taskStatus2Entity.get(ttStatus);
        if (!entity) {
          return;
        }

        if (latestPipelinerun) {
          const { action, id: pID } = latestPipelinerun;
          if (action === PublishType.BUILD_DEPLOY) {
            refreshLog(pID);
          }
        }

        setStepStatus(entity.stepStatus);
        if (task === RunningTask.BUILD) {
          steps[0] = {
            title: entity.buildTitle,
            icon: entity.icon,
          };
        } else {
          const succeed = taskStatus2Entity.get(TaskStatus.SUCCEEDED);
          steps[0] = {
            title: succeed!.buildTitle,
            icon: smile,
          };
          const { status } = clusterStatus;
          if (status !== ClusterStatus.NOTFOUND) {
            setCurrent(1);
            // 判断action，除非为build_deploy，不然只展示deploy step
            // 2021.12.15 刚迁移过来的应用，没有PipelineID，所以隐藏"构建"Tab
            if (latestPipelinerun?.action === PublishType.BUILD_DEPLOY) {
              steps[1] = {
                title: entity.deployTitle,
                icon: entity.icon,
              };
              setSteps(steps);
            } else {
              setSteps([{
                title: entity.deployTitle,
                icon: entity.icon,
              }]);
            }
          }
        }
      }
    },
  });

  const podsInfo = refreshPodsInfo(statusData);

  const currentPodsTabTitle = podsInfo.oldPods.length > 0
    ? intl.formatMessage({ id: 'pages.cluster.podsTable.newPods' })
    : intl.formatMessage({ id: 'pages.common.pods' });
  const oldPodsTitle = intl.formatMessage({ id: 'pages.cluster.podsTable.oldPods' });
  const formatTabTitle = (title: string, length: number) => (
    <div>
      {title}
      <span className={styles.tabNumber}>{length}</span>
    </div>
  );

  let clusterStatus = statusData?.clusterStatus.status || '';
  if (statusData?.clusterStatus.manualPaused) {
    clusterStatus = ClusterStatus.MANUALPAUSED;
  }

  const baseInfo: Param[][] = [
    [
      {
        key: intl.formatMessage({ id: 'pages.cluster.basic.status' }),
        value: <StatusComponent status={clusterStatus} />,
        description: intl.formatMessage({ id: 'pages.message.cluster.status.desc' }),
      },
      {
        key: intl.formatMessage({ id: 'pages.common.pods' }),
        value: {
          [intl.formatMessage({ id: 'pages.cluster.status.normal' })]: podsInfo.healthyPods.length,
          [intl.formatMessage({ id: 'pages.cluster.status.abnormal' })]: podsInfo.notHealthyPods.length,
        },
      },
    ],
    [
      {
        key: intl.formatMessage({ id: 'pages.common.region' }),
        value: (cluster && region2DisplayName) ? region2DisplayName.get(cluster.scope.region) : '',
      },
      {
        key: intl.formatMessage({ id: 'pages.common.env' }),
        value: (cluster && env2DisplayName) ? env2DisplayName.get(cluster.scope.environment) : '',
      },
    ],
    [
      {
        key: intl.formatMessage({ id: 'pages.common.images' }),
        value: Array.from(podsInfo.images),
      },
    ],
  ];

  if (typeof statusData?.ttlSeconds === 'number') {
    baseInfo[0].push({
      key: intl.formatMessage({ id: 'pages.cluster.basic.expireIn' }),
      value: <DurationDisplay seconds={statusData?.ttlSeconds as number} />,
      description: intl.formatMessage({ id: 'pages.message.cluster.ttl.hint' }),
    });
  }

  const onClickOperation = ({ key }: { key: string }) => {
    switch (key) {
      case 'builddeploy':
        history.push({
          pathname: `/clusters${fullPath}/-/pipelines/new`,
          search: stringify({
            type: PublishType.BUILD_DEPLOY,
          }),
        });
        break;
      case 'deploy':
        history.push({
          pathname: `/clusters${fullPath}/-/pipelines/new`,
          search: stringify({
            type: PublishType.DEPLOY,
          }),
        });
        break;
      case 'restart':
        Modal.confirm({
          title: intl.formatMessage({ id: 'pages.message.cluster.restart.confirm' }),
          onOk() {
            restart(id).then(() => {
              successAlert(intl.formatMessage({ id: 'pages.message.cluster.restart.success' }));
            });
          },
        });
        break;
      case 'rollback':
        history.push(`/clusters${fullPath}/-/pipelines?category=rollback`);
        successAlert(intl.formatMessage({ id: 'pages.message.cluster.rollback.hint' }));
        break;
      case 'editCluster':
        history.push(`/clusters${fullPath}/-/editv2`);
        break;
      case 'freeCluster':
        Modal.confirm({
          title: intl.formatMessage({ id: 'pages.message.cluster.free.confirm' }),
          content: intl.formatMessage({ id: 'pages.message.cluster.free.content' }),
          onOk() {
            freeCluster(id).then(() => {
              successAlert(intl.formatMessage({ id: 'pages.message.cluster.free.process' }));
            });
          },
        });
        break;
      default:
    }
  };

  const onClickOperationWithResumePrompt = ({ key }: { key: string }) => {
    const needResumePrompt = ['builddeploy', 'deploy', 'restart', 'rollback'];
    if (clusterStatus === ClusterStatus.MANUALPAUSED && needResumePrompt.includes(key)) {
      Modal.info({
        title: intl.formatMessage({ id: 'pages.message.cluster.resume.hint' }),
        icon: <ExclamationCircleOutlined />,
        okText: intl.formatMessage({ id: 'pages.common.confirm' }),
        onOk: () => {
          onClickOperation({ key });
        },
        onCancel: () => {
          onClickOperation({ key });
        },
      });
    } else {
      onClickOperation({ key });
    }
  };

  const onDeleteCluster = () => {
    Modal.confirm({
      title: intl.formatMessage({ id: 'pages.message.cluster.delete.confirm' }),
      content: intl.formatMessage({ id: 'pages.message.cluster.delete.content' }),
      onOk() {
        deleteCluster(cluster!.id).then(() => {
          successAlert(intl.formatMessage({ id: 'pages.message.cluster.delete.process' }));
          window.location.href = `${cluster!.fullPath.substring(0, cluster!.fullPath.lastIndexOf('/'))}`;
        });
      },
    });
  };

  const operateDropdown = (
    <Menu onClick={onClickOperationWithResumePrompt}>
      <Menu.Item
        disabled={!RBAC.Permissions.rollbackCluster.allowed || isRestrictedStatus(clusterStatus)}
        key="rollback"
      >
        {intl.formatMessage({ id: 'pages.cluster.action.rollback' })}
      </Menu.Item>
      <Menu.Item
        disabled={!RBAC.Permissions.updateCluster.allowed}
        key="editCluster"
      >
        {intl.formatMessage({ id: 'pages.cluster.action.edit' })}
      </Menu.Item>
      <Menu.Item
        disabled={!RBAC.Permissions.freeCluster.allowed
          || isRestrictedStatus(clusterStatus) || clusterStatus === ClusterStatus.FREED}
        key="freeCluster"
      >
        {intl.formatMessage({ id: 'pages.cluster.action.free' })}
      </Menu.Item>
      <Tooltip
        title={clusterStatus !== ClusterStatus.FREED && intl.formatMessage({ id: 'pages.message.cluster.delete.freeFirst' })}
      >
        <div>
          <Menu.Item
            onClick={onDeleteCluster}
            disabled={!RBAC.Permissions.deleteCluster.allowed || clusterStatus !== ClusterStatus.FREED}
            key="deleteCluster"
          >
            {intl.formatMessage({ id: 'pages.cluster.action.delete' })}
          </Menu.Item>
        </div>
      </Tooltip>
    </Menu>
  );

  const strongTxt = (txt: string) => (
    <span style={{ color: 'green' }}>
      {txt}
    </span>
  );

  const getTips = () => (
    <div style={{ color: 'grey', marginTop: '15px', textAlign: 'center' }}>
      <div style={{ display: 'inline-block', textAlign: 'left' }}>
        【
        {' '}
        {strongTxt(intl.formatMessage({ id: 'pages.message.pods.tip1' }))}
        {' '}
        】
        {intl.formatMessage({ id: 'pages.message.pods.tip1.content0.1' })}
        【
        {' '}
        {strongTxt(intl.formatMessage({ id: 'pages.message.pods.tip.notRunning' }))}
        {' '}
        】
        {intl.formatMessage({ id: 'pages.message.pods.tip1.content0.2' })}
        {intl.formatMessage({ id: 'pages.message.pods.tip1.content0.3' })}
        <br />
        &nbsp;
        {intl.formatMessage({ id: 'pages.message.pods.tip1.content0.4' })}
        {' '}
        {strongTxt(intl.formatMessage({ id: 'pages.common.more' }))}
        {' '}
        {intl.formatMessage({ id: 'pages.message.pods.tip1.content0.5' })}
        {' '}
        <br />
        &nbsp;&nbsp;
        {intl.formatMessage({ id: 'pages.message.pods.tip1.content1.1' })}
        {' '}
        <br />
        &nbsp;&nbsp;
        {intl.formatMessage({ id: 'pages.message.pods.tip1.content1.2' })}
        {' '}
        <br />
        &nbsp;&nbsp;
        {intl.formatMessage({ id: 'pages.message.pods.tip1.content1.3' })}
        {' '}
        <br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        {intl.formatMessage({ id: 'pages.message.pods.tip1.content1.3.1' })}
        {' '}
        <br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        {intl.formatMessage({ id: 'pages.message.pods.tip1.content1.3.2' })}
        {' '}
        <br />
        &nbsp;
        {intl.formatMessage({ id: 'pages.message.pods.tip1.content2.1' })}
        {' '}
        {strongTxt(intl.formatMessage({ id: 'pages.cluster.podsTable.monitor' }))}
        {' '}
        {intl.formatMessage({ id: 'pages.message.pods.tip1.content2.2' })}
        {' '}
        <br />
        &nbsp;
        {intl.formatMessage({ id: 'pages.message.pods.tip1.content3' })}
        {' '}
        <br />
        <br />
        <br />
        【
        {' '}
        {strongTxt(intl.formatMessage({ id: 'pages.message.pods.tip2' }))}
        {' '}
        】
        {intl.formatMessage({ id: 'pages.message.pods.tip2.content1' })}
        【
        {' '}
        {strongTxt(intl.formatMessage({ id: 'pages.pods.manualPause' }))}
        {' '}
        】
        {intl.formatMessage({ id: 'pages.message.pods.tip1.content0.2' })}
        {intl.formatMessage({ id: 'pages.message.pods.tip2.content2' })}
        {' '}
        {strongTxt(intl.formatMessage({ id: 'pages.pods.unpause' }))}
        {' '}
        】
        {intl.formatMessage({ id: 'pages.message.pods.tip2.content3' })}
        <br />
      </div>
    </div>
  );

  // used by build log ops
  const onCopyButtonClick = () => {
    if (copy(buildLog)) {
      successAlert(intl.formatMessage({ id: 'component.FullscreenModal.copySuccess' }));
    } else {
      errorAlert(intl.formatMessage({ id: 'component.FullscreenModal.copyFailed' }));
    }
  };
  const onFullscreenClick = () => {
    setFullscreen(true);
  };

  const onClose = () => {
    setFullscreen(false);
  };

  const currentTab = userClickedCurrent > -1 ? userClickedCurrent : current;

  return (
    <PageWithBreadcrumb>
      <div>
        <div style={{ marginBottom: '5px', textAlign: 'right' }}>
          <Button
            disabled={!RBAC.Permissions.buildAndDeployCluster.allowed || isRestrictedStatus(clusterStatus)}
            type="primary"
            onClick={() => {
              onClickOperationWithResumePrompt({ key: 'builddeploy' });
            }}
            style={{ marginRight: '10px' }}
          >
            {intl.formatMessage({ id: 'pages.cluster.action.buildDeploy' })}
          </Button>
          <Button
            disabled={!RBAC.Permissions.deployCluster.allowed || isRestrictedStatus(clusterStatus)}
            onClick={() => {
              onClickOperationWithResumePrompt({ key: 'deploy' });
            }}
            style={{ marginRight: '10px' }}
          >
            {intl.formatMessage({ id: 'pages.cluster.action.deploy' })}
          </Button>
          <Button
            disabled={!RBAC.Permissions.restartCluster.allowed || isRestrictedStatus(clusterStatus)}
            onClick={() => {
              onClickOperationWithResumePrompt({ key: 'restart' });
            }}
            style={{ marginRight: '10px' }}
          >
            {intl.formatMessage({ id: 'pages.cluster.action.restart' })}
          </Button>
          <Dropdown overlay={operateDropdown} trigger={['click']} overlayStyle={{}}>
            <Button>
              {intl.formatMessage({ id: 'pages.common.more' })}
              <DownOutlined />
            </Button>
          </Dropdown>
        </div>
      </div>

      <DetailCard
        title={intl.formatMessage({ id: 'pages.common.basicInfo' })}
        data={baseInfo}
      />

      {
        inPublishing(statusData) && !(clusterStatus === ClusterStatus.FREEING) && (
          <Row>
            <Col span={4}>
              <HSteps
                current={currentTab}
                status={stepStatus}
                steps={steps}
                onChange={(cur) => {
                  setCurrent(cur);
                  setUserClickedCurrent(cur);
                }}
              />
            </Col>
            <Col span={20}>
              <div className={styles.stepsContent}>
                {
                  currentTab === 0 && (
                  <div>
                    <div style={{ display: 'flex' }}>
                      <span
                        style={{ marginBottom: '10px', fontSize: '16px', fontWeight: 'bold' }}
                      >
                        {intl.formatMessage({ id: 'pages.pods.buildLog' })}
                      </span>
                      {
                        canCancelPublish(statusData)
                        && (
                        <Button
                          danger
                          style={{ marginLeft: '10px', marginBottom: '10px' }}
                          onClick={() => {
                            cancelPipeline(statusData!.latestPipelinerun!.id).then(() => {
                              successAlert(intl.formatMessage({ id: 'pages.message.cluster.deployCancel.success' }));
                            });
                          }}
                        >
                          {intl.formatMessage({ id: 'pages.pods.deployCancel' })}
                        </Button>
                        )
                      }
                      <div style={{ flex: 1 }} />
                      <Button className={styles.buttonClass}>
                        <CopyOutlined className={styles.iconCommonModal} onClick={onCopyButtonClick} />
                      </Button>
                      <Button className={styles.buttonClass}>
                        <FullscreenOutlined className={styles.iconCommonModal} onClick={onFullscreenClick} />
                      </Button>
                    </div>
                    <div style={{ height: '500px' }}>
                      <CodeEditor content={buildLog} />
                    </div>
                  </div>
                  )
                }
                {
                  currentTab === 1 && statusData?.runningTask.task === RunningTask.DEPLOY && statusData.clusterStatus.step
                  && (
                    <div>
                      <DeployPage
                        status={statusData}
                        step={statusData.clusterStatus.step}
                        onNext={
                          () => {
                            next(id).then(() => {
                              successAlert(
                                intl.formatMessage(
                                  { id: 'pages.message.pods.step.deploy' },
                                  { index: statusData.clusterStatus.step!.index + 1 },
                                ),
                              );
                              refreshStatus();
                            });
                          }
                        }
                        onPause={
                          () => {
                            pause(id).then(() => {
                              successAlert(intl.formatMessage({ id: 'pages.message.cluster.manualPause.success' }));
                              refreshStatus();
                            });
                          }
                        }
                        onResume={
                          () => {
                            resume(id).then(() => {
                              successAlert(intl.formatMessage({ id: 'pages.message.cluster.unpause.success' }));
                              refreshStatus();
                            });
                          }
                        }
                        onPromote={
                          () => {
                            Modal.confirm(
                              {
                                title: (
                                  <div className={styles.boldText}>
                                    {intl.formatMessage({ id: 'pages.message.cluster.deployAll.confirm' })}
                                  </div>
                                ),
                                content: (
                                  <div className={styles.promotePrompt}>
                                    {intl.formatMessage({ id: 'pages.message.cluster.deployAll.content1' })}
                                    <br />
                                    1.
                                    {' '}
                                    <span className={styles.textGreen}>
                                      {intl.formatMessage({ id: 'pages.message.cluster.deployAll.strategySafe' })}
                                    </span>
                                    :
                                    {' '}
                                    {intl.formatMessage({ id: 'pages.message.cluster.deployAll.content2' })}
                                    {' '}
                                    <br />
                                    2.
                                    {' '}
                                    <span className={styles.textGreen}>
                                      {intl.formatMessage({ id: 'pages.message.cluster.deployAll.strategyRoll' })}
                                    </span>
                                    :
                                    {' '}
                                    {intl.formatMessage({ id: 'pages.message.cluster.deployAll.content3' })}
                                    <br />
                                    {intl.formatMessage({ id: 'pages.message.cluster.deployAll.content4' })}
                                    <br />
                                    {intl.formatMessage({ id: 'pages.message.cluster.deployAll.content5' })}
                                    <br />
                                    {intl.formatMessage({ id: 'pages.message.cluster.deployAll.content6' })}
                                  </div>
                                ),
                                onOk: () => {
                                  promote(id).then(() => {
                                    successAlert(intl.formatMessage({ id: 'pages.message.cluster.unpause.success' }));
                                    refreshStatus();
                                  });
                                },
                                width: '750px',
                              },
                            );
                          }
                        }
                        onCancelDeploy={
                          () => {
                            // query latest canRollback pipelinerun
                            getPipelines(id, {
                              pageNumber: 1, pageSize: 1, canRollback: true,
                            }).then(({ data }) => {
                              const { total } = data;
                              // first deploy, just free cluster
                              if (total === 0) {
                                Modal.confirm(
                                  {
                                    title: (
                                      <div className={styles.boldText}>
                                        {intl.formatMessage({ id: 'pages.message.cluster.deployCancel.confirm' })}
                                      </div>
                                    ),
                                    content: (
                                      <div>
                                        {intl.formatMessage({ id: 'pages.message.cluster.deployCancel.first.content1' })}
                                        <strong style={{ color: 'red' }}>
                                          {intl.formatMessage({ id: 'pages.message.cluster.deployCancel.first.content2' })}
                                        </strong>
                                      </div>
                                    ),
                                    onOk: () => {
                                      freeCluster(id).then(() => {
                                        successAlert(intl.formatMessage(
                                          { id: 'pages.message.cluster.deployCancel.first.success' },
                                        ));
                                      });
                                    },
                                    width: '750px',
                                  },
                                );
                              } else {
                                Modal.confirm(
                                  {
                                    title: (
                                      <div className={styles.boldText}>
                                        {intl.formatMessage({ id: 'pages.message.cluster.deployCancel.confirm' })}
                                      </div>
                                    ),
                                    content: (
                                      <div>
                                        <strong style={{ color: 'red' }}>
                                          {intl.formatMessage({ id: 'pages.message.cluster.deployCancel.content' })}
                                        </strong>
                                        <br />
                                      </div>
                                    ),
                                    onOk: () => {
                                      history.push(`/clusters${fullPath}/-/pipelines?category=rollback`);
                                    },
                                    okText: intl.formatMessage({ id: 'pages.common.confirm' }),
                                    width: '750px',
                                  },
                                );
                              }
                            });
                          }
                        }
                        nextStepString={intl.formatMessage({ id: 'pages.pods.nextStep' })}
                      />
                      {getTips()}
                    </div>
                  )
                }
              </div>
            </Col>
          </Row>
        )
      }

      <Tabs size="large">
        <TabPane tab={formatTabTitle(currentPodsTabTitle, podsInfo.newPods.length)}>
          <PodsTable data={podsInfo.newPods} cluster={cluster!} />
        </TabPane>
      </Tabs>

      {
        podsInfo.oldPods.length > 0 && (
        <Tabs size="large">
          <TabPane tab={formatTabTitle(oldPodsTitle, podsInfo.oldPods.length)}>
            <PodsTable data={podsInfo.oldPods} cluster={cluster!} />
          </TabPane>
        </Tabs>
        )
      }
      <FullscreenModal
        title=""
        visible={fullscreen}
        onClose={onClose}
        fullscreen
        supportFullscreenToggle={false}
      >
        <CodeEditor
          content={buildLog}
        />
      </FullscreenModal>
    </PageWithBreadcrumb>
  );
};
