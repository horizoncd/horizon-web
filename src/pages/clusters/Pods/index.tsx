import {Button, Col, Dropdown, Menu, Modal, Row, Steps, Tabs, Tooltip} from "antd";
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb'
import {useIntl} from "@@/plugin-locale/localeExports";
import {useModel} from "@@/plugin-model/useModel";
import {useRequest} from "@@/plugin-request/request";
import PodsTable from './PodsTable'
import {deleteCluster, freeCluster, getCluster, getClusterStatus, next, restart} from "@/services/clusters/clusters";
import type {ReactNode} from 'react';
import {useState} from 'react';
import HSteps from '@/components/HSteps'
import {DownOutlined, FrownOutlined, HourglassOutlined, LoadingOutlined, SmileOutlined} from "@ant-design/icons";
import {ClusterStatus, PublishType, RunningTask, TaskStatus} from "@/const";
import styles from './index.less';
import {cancelPipeline, queryPipelineLog} from "@/services/pipelineruns/pipelineruns";
import CodeEditor from "@/components/CodeEditor";
import type {Param} from "@/components/DetailCard";
import DetailCard from "@/components/DetailCard";
import {history} from 'umi';
import {stringify} from "querystring";
import Utils from '@/utils'
import {getStatusComponent, isRestrictedStatus} from "@/components/State";
import RBAC from '@/rbac'
import {queryEnvironments, queryRegions} from "@/services/environments/environments";

const {TabPane} = Tabs;
const {Step} = Steps;
const smile = <SmileOutlined/>
const loading = <LoadingOutlined/>
const frown = <FrownOutlined/>
const waiting = <HourglassOutlined/>

const taskStatus2Entity = new Map<TaskStatus, {
  icon: JSX.Element,
  buildTitle: ReactNode,
  deployTitle: ReactNode,
  stepStatus: 'wait' | 'process' | 'finish' | 'error',
}>([
  [TaskStatus.PENDING, {icon: loading, buildTitle: '构建中...', deployTitle: '发布中...', stepStatus: 'process'}],
  [TaskStatus.RUNNING, {icon: loading, buildTitle: '构建中...', deployTitle: '发布中...', stepStatus: 'process'}],
  [TaskStatus.SUCCEEDED, {icon: smile, buildTitle: '构建完成', deployTitle: '发布完成', stepStatus: 'finish'}],
  [TaskStatus.FAILED, {
    icon: frown,
    buildTitle: <span style={{color: 'red'}}>构建失败</span>,
    deployTitle: <span style={{color: 'red'}}>发布失败</span>,
    stepStatus: 'error'
  }]
]);

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

interface DeployPageProps {
  step: {
    index: number,
    total: number
  },
  onNext: () => void,
  status: CLUSTER.ClusterStatus
}

const pollingInterval = 6000;
const pendingState = 'pending'
const runningState = 'running'
const onlineState = 'online'
const offlineState = 'offline'

export default () => {

  const intl = useIntl();
  const {initialState} = useModel('@@initialState');
  const {successAlert} = useModel('alert')
  const {id, fullPath} = initialState!.resource;
  const [current, setCurrent] = useState(0);
  const [stepStatus, setStepStatus] = useState<'wait' | 'process' | 'finish' | 'error'>('wait');
  const [env2DisplayName, setEnv2DisplayName] = useState<Map<string, string>>();
  const [region2DisplayName, setRegion2DisplayName] = useState<Map<string, string>>();

  const {data: cluster} = useRequest(() => getCluster(id), {
    pollingInterval,
  });

  const {data: envs} = useRequest(queryEnvironments, {
    onSuccess: () => {
      const e = new Map<string, string>();
      envs!.forEach(item => e.set(item.name, item.displayName))
      setEnv2DisplayName(e)
    }
  });
  const {data: regions} = useRequest(() => queryRegions(cluster!.scope.environment), {
    onSuccess: () => {
      const e = new Map<string, string>();
      regions!.forEach(item => e.set(item.name, item.displayName))
      setRegion2DisplayName(e)
    },
    ready: !!cluster
  });

  const inPublishing = (statusData?: CLUSTER.ClusterStatus) => {
    const taskStatus = statusData?.runningTask.taskStatus as TaskStatus
    // 2021.12.15 应用迁移到Horizon后，latestPipelinerun为null
    return taskStatus === TaskStatus.RUNNING || taskStatus === TaskStatus.PENDING || taskStatus === TaskStatus.FAILED
  }

  const canCancelPublish = (statusData?: CLUSTER.ClusterStatus) => {
    const taskStatus = statusData?.runningTask.taskStatus as TaskStatus
    const task = statusData?.runningTask.task as RunningTask
    return task === RunningTask.BUILD && (taskStatus === TaskStatus.RUNNING || taskStatus === TaskStatus.PENDING)
  }

  const {data: buildLog, run: refreshLog} = useRequest((pID) => queryPipelineLog(pID), {
    formatResult: (res) => {
      return res
    },
    manual: true
  })

  const [steps, setSteps] = useState<{
    title: ReactNode,
    icon: JSX.Element
  }[]>([
    {
      title: '待构建',
      icon: waiting
    },
    {
      title: '待发布',
      icon: waiting
    },
  ]);

  const refreshPodsInfo = (data?: CLUSTER.ClusterStatus) => {
    const oldPods: CLUSTER.PodInTable[] = []
    const newPods: CLUSTER.PodInTable[] = []
    const healthyPods: CLUSTER.PodInTable[] = []
    const notHealthyPods: CLUSTER.PodInTable[] = []
    const images = new Set<string>()
    if (!data) {
      return {
        newPods,
        oldPods,
        healthyPods,
        notHealthyPods,
        images
      }
    }

    const {podTemplateHash, versions} = data.clusterStatus;
    if (versions) {
      Object.keys(versions).forEach(version => {
        const versionObj = versions[version]
        const {pods} = versionObj
        if (pods) {
          Object.keys(pods).forEach(podName => {
            const podObj = versionObj.pods[podName]
            const {status, spec, metadata} = podObj
            const {containers, initContainers} = spec
            const {namespace, creationTimestamp} = metadata
            const {containerStatuses} = status
            const state = {
              state: pendingState,
              reason: '',
              message: ''
            }
            let restartCount = 0
            let onlineStatus = offlineState
            if (containerStatuses && containerStatuses.length > 0) {
              Object.assign(state, containerStatuses[0].state)

              restartCount = containerStatuses[0].restartCount
              onlineStatus = containerStatuses[0].ready ? onlineState : offlineState
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
            };
            if (state.state === runningState) {
              healthyPods.push(podInTable)
            } else {
              notHealthyPods.push(podInTable)
            }
            if (podTemplateHash === version) {
              newPods.push(podInTable)
              if (initContainers) {
                initContainers.forEach(item => images.add(item.image))
              }
              containers.forEach(item => images.add(item.image));
            } else {
              oldPods.push(podInTable)
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
      images
    }
  }
  const {data: statusData, run: refreshStatus} = useRequest(() => getClusterStatus(id), {
    pollingInterval,
    onSuccess: () => {
      if (inPublishing(statusData)) {
        const {latestPipelinerun, clusterStatus} = statusData!
        const {task: t, taskStatus: tStatus} = statusData!.runningTask;

        const ttStatus = tStatus as TaskStatus
        const entity = taskStatus2Entity.get(ttStatus)
        if (!entity) {
          return
        }

        if (latestPipelinerun) {
          const {action, id: pID} = latestPipelinerun;
          if (action === PublishType.BUILD_DEPLOY) {
            refreshLog(pID);
          }
        }

        setStepStatus(entity.stepStatus);
        if (t === RunningTask.BUILD) {
          steps[0] = {
            title: entity.buildTitle,
            icon: entity.icon,
          }
        } else {
          const succeed = taskStatus2Entity.get(TaskStatus.SUCCEEDED)
          steps[0] = {
            title: succeed!.buildTitle,
            icon: smile,
          }
          const {status} = clusterStatus;
          if (status !== ClusterStatus.NOTFOUND) {
            setCurrent(1)
            // 判断action，除非为build_deploy，不然只展示deploy step
            // 2021.12.15 刚迁移过来的应用，没有PipelineID，所以隐藏"构建"Tab
            if (latestPipelinerun?.action === PublishType.BUILD_DEPLOY) {
              steps[1] = {
                title: entity.deployTitle,
                icon: entity.icon,
              };
              setSteps(steps)
            } else {
              setSteps([{
                title: entity.deployTitle,
                icon: entity.icon,
              }])
            }
          }
        }
      }
    }
  });

  const podsInfo = refreshPodsInfo(statusData)

  function BuildPage({log}: { log: string }) {
    return <div style={{height: '500px'}}>
      <div>
        <span style={{marginBottom: '10px', fontSize: '16px', fontWeight: 'bold'}}>构建日志</span>
        {
          canCancelPublish(statusData) &&
          <Button danger style={{marginLeft: '10px', marginBottom: '10px'}} onClick={() => {
            cancelPipeline(statusData!.latestPipelinerun!.id).then(() => {
              successAlert('取消发布成功')
            })
          }}>
            取消发布
          </Button>
        }
      </div>
      <CodeEditor content={log}/>
    </div>
  }

  function DeployStep({index, total}: { index: number, total: number }) {
    const s = []
    for (let i = 0; i < total; i += 1) {
      s.push({
        title: `批次${i + 1}`
      })
    }
    return <Steps current={index}>
      {s.map((item, idx) => {
        let icon;
        if (idx < index) {
          icon = smile
        } else if (idx === index) {
          if (statusData?.clusterStatus.status === ClusterStatus.SUSPENDED) {
            icon = waiting;
          } else {
            icon = loading
          }
        } else {
          icon = waiting
        }
        return <Step key={item.title} title={item.title} icon={icon}/>;
      })}
    </Steps>
  }

  function DeployPage({step, onNext, status}: DeployPageProps) {
    const {index, total} = step
    return <div title={"发布阶段"}>
      <DeployStep {...step}/>
      <div style={{textAlign: 'center'}}>
        {
          index < total && status.clusterStatus.status === ClusterStatus.SUSPENDED &&
          <Button type="primary" style={{margin: '0 8px'}} onClick={onNext}>
            {intl.formatMessage({id: 'pages.pods.nextStep'})}
          </Button>
        }
      </div>
    </div>
  }

  const currentPodsTabTitle = podsInfo.oldPods.length > 0 ? '新Pods' : 'Pods'
  const oldPodsTitle = '旧Pods';
  const formatTabTitle = (title: string, length: number) => {
    return <div>
      {title}<span className={styles.tabNumber}>{length}</span>
    </div>
  };

  const clusterStatus = cluster?.status ? cluster.status : (statusData?.clusterStatus.status || '')

  const baseInfo: Param[][] = [
    [
      {
        key: '集群状态',
        value: getStatusComponent(clusterStatus),
        description: `正常： 集群已正常发布
        暂停： 集群处于发布批次暂停中
        异常： 集群处于异常状态
        未发布： 集群尚未发布
        发布中： 集群正在发布中
        已释放： 集群的资源已被释放，与未发布状态类似，可重新构建发布
        释放中： 集群处于资源释放中，无法继续操作集群
        删除中： 集群处于删除中，无法继续操作集群`
      },
      {
        key: 'Pods数量',
        value: {
          '正常': podsInfo.healthyPods.length,
          '异常': podsInfo.notHealthyPods.length,
        }
      }
    ],
    [
      {
        key: '区域',
        value: (cluster && region2DisplayName) ? region2DisplayName.get(cluster.scope.region) : ''
      },
      {
        key: '环境',
        value: (cluster && env2DisplayName) ? env2DisplayName.get(cluster.scope.environment) : ''
      }
    ],
    [
      {
        key: '代码',
        value: {
          URL: cluster?.git.url || '',
          Branch: cluster?.git.branch || '',
        }
      }
    ],
    [
      {
        key: '镜像',
        value: Array.from(podsInfo.images),
      }
    ]
  ]

  if (cluster?.latestDeployedCommit) {
    // @ts-ignore
    baseInfo[2][0].value['Commit ID'] = cluster!.latestDeployedCommit
  }

  const onClickOperation = ({key}: { key: string }) => {
    switch (key) {
      case 'builddeploy':
        history.push({
          pathname: `/clusters${fullPath}/-/pipelines/new`,
          search: stringify({
            type: PublishType.BUILD_DEPLOY,
          })
        })
        break;
      case 'deploy':
        history.push({
          pathname: `/clusters${fullPath}/-/pipelines/new`,
          search: stringify({
            type: PublishType.DEPLOY,
          })
        })
        break;
      case 'restart':
        Modal.confirm({
          title: '确定重启所有Pods?',
          onOk() {
            restart(id).then(() => {
              successAlert('重启操作提交成功')
            })
          },
        });
        break;
      case 'rollback':
        history.push(`/clusters${fullPath}/-/pipelines?category=rollback`)
        successAlert('请选择流水线进行回滚')
        break;
      case 'editCluster':
        history.push(`/clusters${fullPath}/-/edit`)
        break;
      case 'freeCluster':
        Modal.confirm({
          title: '确定释放集群?',
          content: '销毁所有pod并归还资源，保留集群配置',
          onOk() {
            freeCluster(id).then(() => {
              successAlert('开始释放集群...')
            })
          },
        });
        break;
      default:
    }
  }

  const onDeleteCluster = () => {
    Modal.confirm({
      title: '确定删除集群?',
      content: '删除后，数据将无法恢复',
      onOk() {
        deleteCluster(cluster!.id).then(() => {
          successAlert('开始删除集群')
          window.location.href = `/applications${cluster!.fullPath.substring(0, cluster!.fullPath.lastIndexOf('/'))}/-/clusters`
        })
      },
    });
  }


  const operateDropdown = <Menu onClick={onClickOperation}>
    <Menu.Item
      disabled={!RBAC.Permissions.rollbackCluster.allowed || isRestrictedStatus(clusterStatus)}
      key="rollback">回滚</Menu.Item>
    <Menu.Item disabled={!RBAC.Permissions.updateCluster.allowed} key="editCluster">修改集群</Menu.Item>
    <Menu.Item
      disabled={!RBAC.Permissions.freeCluster.allowed || isRestrictedStatus(clusterStatus) || clusterStatus === ClusterStatus.FREED}
      key="freeCluster">释放集群</Menu.Item>
    <Tooltip title={clusterStatus !== ClusterStatus.FREED && '请先释放集群，再进行删除'}>
      <div>
        <Menu.Item onClick={onDeleteCluster}
                   disabled={!RBAC.Permissions.deleteCluster.allowed || clusterStatus !== ClusterStatus.FREED}
                   key="deleteCluster">
          删除集群
        </Menu.Item>
      </div>
    </Tooltip>
  </Menu>;

  const infoWhenNotHealthy = <strong style={{color: 'red'}}>
    建议排查步骤：<br/>
    1. 点击【查看日志】 查看启动日志中是否有异常信息 <br/><br/>
    2. 点击【查看events】 查看事件列表中是否有Warning类型的事件 <br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2.1 确认健康检查端口配置 <br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2.2 确认上线接口调用耗时是否过长 <br/><br/>
    3. 点击【Terminal】 登陆容器查看业务日志 如无法登陆请点击 <a target="_blank"
                                           href={`http://music-pylon.hz.netease.com/cmslog-v2/log/list?clusterName=${cluster?.name}&env=${env2MlogEnv.get(cluster?.scope.environment || 'dev')}&loggerLevel=ERROR`}>链接</a> 跳转mlog日志平台查看
  </strong>

  return (
    <PageWithBreadcrumb>
      <div>
        <div style={{marginBottom: '5px', textAlign: 'right'}}>
          <Button
            disabled={!RBAC.Permissions.buildAndDeployCluster.allowed || isRestrictedStatus(clusterStatus)}
            type="primary" onClick={() => onClickOperation({key: 'builddeploy'})}
            style={{marginRight: '10px'}}>
            构建发布
          </Button>
          <Button disabled={!RBAC.Permissions.deployCluster.allowed || isRestrictedStatus(clusterStatus)}
                  onClick={() => onClickOperation({key: 'deploy'})}
                  style={{marginRight: '10px'}}>
            直接发布
          </Button>
          <Button disabled={!RBAC.Permissions.restartCluster.allowed || isRestrictedStatus(clusterStatus)}
                  onClick={() => onClickOperation({key: 'restart'})}
                  style={{marginRight: '10px'}}>
            重新启动
          </Button>
          <Dropdown overlay={operateDropdown} trigger={["click"]} overlayStyle={{}}>
            <Button>{intl.formatMessage({id: 'pages.applicationDetail.basic.operate'})}<DownOutlined/></Button>
          </Dropdown>
        </div>
      </div>

      <DetailCard
        title={"基础信息"}
        data={baseInfo}
      />

      {
        inPublishing(statusData) && (
          <Row>
            <Col span={4}>
              <HSteps current={current} status={stepStatus} steps={steps} onChange={setCurrent}/>
            </Col>
            <Col span={20}>
              <div className={styles.stepsContent}>
                {
                  current === 0 && <BuildPage log={buildLog}/>
                }
                {
                  current === 1 && statusData?.runningTask.task === RunningTask.DEPLOY && statusData.clusterStatus.status !== ClusterStatus.NOTFOUND &&
                  (
                    statusData.clusterStatus.status === ClusterStatus.DEGRADED ? infoWhenNotHealthy :
                      <DeployPage status={statusData} step={statusData.clusterStatus.step} onNext={() => {
                        next(id).then(() => {
                          successAlert(`第${statusData.clusterStatus.step.index + 1}批次开始发布`)
                          refreshStatus()
                        })
                      }
                      }/>
                  )
                }
              </div>
            </Col>
          </Row>
        )
      }

      <Tabs size={'large'}>
        <TabPane tab={formatTabTitle(currentPodsTabTitle, podsInfo.newPods.length)}>
          <PodsTable data={podsInfo.newPods} cluster={cluster!}/>
        </TabPane>
      </Tabs>

      {
        podsInfo.oldPods.length > 0 && <Tabs size={'large'}>
          <TabPane tab={formatTabTitle(oldPodsTitle, podsInfo.oldPods.length)}>
            <PodsTable data={podsInfo.oldPods} cluster={cluster!}/>
          </TabPane>
        </Tabs>
      }
    </PageWithBreadcrumb>
  )
};
