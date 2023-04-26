import {
  Button, Modal, Steps, Tooltip,
} from 'antd';
import {
  history, useIntl, useModel,
} from 'umi';
import {
  SmileOutlined, LoadingOutlined, HourglassOutlined,
} from '@ant-design/icons';
import {
  ClusterStatus,
} from '@/const';
import {
  next, pause, resume, getPipelines, freeCluster, autoPromote, cancelAutoPromote,
} from '@/services/clusters/clusters';
import RBAC from '@/rbac';
import { PageWithInitialState } from '@/components/Enhancement';
import { BoldText } from '@/components/Widget';

const { Step } = Steps;
const smile = <SmileOutlined />;
const loading = <LoadingOutlined />;
const waiting = <HourglassOutlined />;

const StrongTxt = ({ txt }:{ txt: string }) => (
  <BoldText style={{ color: 'green' }}>
    {txt}
  </BoldText>
);

const Tips = () => {
  const intl = useIntl();
  return (
    <div style={{ color: 'grey', marginTop: '15px', textAlign: 'center' }}>
      <div style={{ display: 'inline-block', textAlign: 'left' }}>
        【
        {' '}
        <StrongTxt txt={intl.formatMessage({ id: 'pages.message.pods.tip1' })} />
        {' '}
        】
        {intl.formatMessage({ id: 'pages.message.pods.tip1.content0.1' })}
        【
        {' '}
        <StrongTxt txt={intl.formatMessage({ id: 'pages.message.pods.tip.notRunning' })} />
        {' '}
        】
        {intl.formatMessage({ id: 'pages.message.pods.tip1.content0.2' })}
        {intl.formatMessage({ id: 'pages.message.pods.tip1.content0.3' })}
        <br />
        &nbsp;
        {intl.formatMessage({ id: 'pages.message.pods.tip1.content0.4' })}
        {' '}
        <StrongTxt txt={intl.formatMessage({ id: 'pages.common.more' })} />
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
        <StrongTxt txt={intl.formatMessage({ id: 'pages.cluster.podsTable.monitor' })} />
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
        <StrongTxt txt={intl.formatMessage({ id: 'pages.message.pods.tip2' })} />
        {' '}
        】
        {intl.formatMessage({ id: 'pages.message.pods.tip2.content1' })}
        【
        {' '}
        <StrongTxt txt={intl.formatMessage({ id: 'pages.pods.manualPause' })} />
        {' '}
        】
        {intl.formatMessage({ id: 'pages.message.pods.tip1.content0.2' })}
        {intl.formatMessage({ id: 'pages.message.pods.tip2.content2' })}
        【
        {' '}
        <StrongTxt txt={intl.formatMessage({ id: 'pages.pods.unpause' })} />
        {' '}
        】
        {intl.formatMessage({ id: 'pages.message.pods.tip2.content3' })}
        <br />
      </div>
    </div>
  );
};

function DeployStep({
  index, total, replicas, statusData,
}: { index: number, total: number, replicas: number[], statusData: CLUSTER.ClusterStatusV2 }) {
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
          if (statusData.status === ClusterStatus.SUSPENDED) {
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
  step: CLUSTER.Step,
  onNext: () => void,
  onPause: () => void,
  onResume: () => void,
  onAutoPromote: () => void,
  onAutoPromoteCancel: () => void,
  onCancelDeploy: () => void,
  statusData: CLUSTER.ClusterStatusV2,
  nextStepString: string
}

function DeployButtons({
  step, onNext, onPause, onResume, onAutoPromote, onAutoPromoteCancel, onCancelDeploy, statusData, nextStepString,
}: DeployPageProps) {
  const intl = useIntl();
  const {
    index, total, replicas, manualPaused, autoPromote: ifAutoPromote,
  } = step;
  return (
    <div title={intl.formatMessage({ id: 'pages.pods.deployStep' })}>
      <DeployStep index={index} total={total} replicas={replicas} statusData={statusData} />
      <div style={{ textAlign: 'center' }}>
        {
          manualPaused ? (
            <Button
              type="primary"
              disabled={!manualPaused || !RBAC.Permissions.resumeCluster.allowed}
              style={{ margin: '0 8px' }}
              onClick={onResume}
            >
              {intl.formatMessage({ id: 'pages.pods.unpause' })}
            </Button>
          ) : (
            <Button
              type="primary"
              disabled={manualPaused
                || statusData.status === ClusterStatus.SUSPENDED
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
            || statusData.status !== ClusterStatus.SUSPENDED
            || manualPaused
          }
          style={{ margin: '0 8px' }}
          onClick={onNext}
        >
          {nextStepString}
        </Button>
        {
          ifAutoPromote ? (
            <Button
              danger
              disabled={
                !RBAC.Permissions.executeAction.allowed
                || manualPaused
              }
              onClick={onAutoPromoteCancel}
            >
              {intl.formatMessage({ id: 'pages.pods.cancelAutoDeploy' })}
            </Button>
          )
            : (
              <Tooltip title={intl.formatMessage({ id: 'pages.message.cluster.autoDeploy.description' })}>
                <Button
                  type="primary"
                  disabled={
                    !RBAC.Permissions.executeAction.allowed
                    || manualPaused
                  }
                  style={{ margin: '0 8px' }}
                  onClick={onAutoPromote}
                >
                  {intl.formatMessage({ id: 'pages.pods.autoDeploy' })}
                </Button>
              </Tooltip>
            )
        }
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

interface RolloutDeployPanelProps {
  clusterStatus: CLUSTER.ClusterStatusV2,
  refresh: () => void,
  initialState: API.InitialState,
  step: CLUSTER.Step
}

function RolloutDeployPanel(props: RolloutDeployPanelProps) {
  const {
    clusterStatus, initialState, refresh, step,
  } = props;
  const { id, fullPath } = initialState.resource;

  const intl = useIntl();
  const { successAlert } = useModel('alert');

  if (!clusterStatus) {
    return null;
  }

  return (
    <div>
      {
        step && (
          <div>
            <DeployButtons
              statusData={clusterStatus}
              step={step}
              onNext={
                () => {
                  next(id).then(() => {
                    successAlert(
                      intl.formatMessage(
                        { id: 'pages.message.pods.step.deploy' },
                        { index: step.index + 1 },
                      ),
                    );
                    refresh();
                  });
                }
              }
              onPause={
                () => {
                  pause(id).then(() => {
                    successAlert(intl.formatMessage({ id: 'pages.message.cluster.manualPause.success' }));
                    refresh();
                  });
                }
              }
              onResume={
                () => {
                  resume(id).then(() => {
                    successAlert(intl.formatMessage({ id: 'pages.message.cluster.unpause.success' }));
                    refresh();
                  });
                }
              }
              onAutoPromote={
                () => {
                  autoPromote(id).then(() => {
                    successAlert(intl.formatMessage({ id: 'pages.message.cluster.autoDeploy.success' }));
                    refresh();
                  });
                }
              }
              onAutoPromoteCancel={
                () => {
                  cancelAutoPromote(id).then(() => {
                    successAlert(intl.formatMessage({ id: 'pages.message.cluster.autoDeployCancel.success' }));
                    refresh();
                  });
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
                            <div style={{ fontWeight: 'bold' }}>
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
                            <div style={{ fontWeight: 'bold' }}>
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
            <Tips />
          </div>
        )
      }
    </div>
  );
}

export default PageWithInitialState(RolloutDeployPanel);
