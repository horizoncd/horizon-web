import {Button, Col, Dropdown, Menu, Modal, Row, Steps, Tabs} from "antd";
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb'
import {useIntl} from "@@/plugin-locale/localeExports";
import {useModel} from "@@/plugin-model/useModel";
import {useRequest} from "@@/plugin-request/request";
import PodsTable from './PodsTable'
import {getCluster, getClusterStatus, next, restart} from "@/services/clusters/clusters";
import {useState} from 'react';
import HSteps from '@/components/HSteps'
import {DownOutlined, FrownOutlined, HourglassOutlined, LoadingOutlined, SmileOutlined} from "@ant-design/icons";
import {ClusterStatus, PublishType, ResourceType, RunningTask, TaskStatus} from "@/const";
import styles from './index.less';
import {cancelPipeline, queryPipelineLog} from "@/services/pipelineruns/pipelineruns";
import CodeEditor from "@/components/CodeEditor";
import type {Param} from "@/components/DetailCard";
import DetailCard from "@/components/DetailCard";
import {history} from 'umi';
import {stringify} from "querystring";
import Utils from '@/utils'

const {TabPane} = Tabs;
const {Step} = Steps;
const smile = <SmileOutlined/>
const loading = <LoadingOutlined/>
const frown = <FrownOutlined/>
const waiting = <HourglassOutlined/>

const taskStatus2Entity = new Map<TaskStatus, {
  icon: JSX.Element,
  buildTitle: string,
  deployTitle: string,
  stepStatus: 'wait' | 'process' | 'finish' | 'error',
}>([
  [TaskStatus.RUNNING, {icon: loading, buildTitle: '构建中...', deployTitle: '发布中...', stepStatus: 'process'}],
  [TaskStatus.SUCCEEDED, {icon: smile, buildTitle: '构建完成', deployTitle: '发布完成', stepStatus: 'finish'}],
  [TaskStatus.FAILED, {icon: frown, buildTitle: '构建失败', deployTitle: '发布失败', stepStatus: 'error'}]
]);

interface DeployPageProps {
  step: {
    index: number,
    total: number
  },
  onNext: () => void,
  onCancel: () => void
}

interface PodsInfo {
  oldPods: CLUSTER.PodInTable[],
  newPods: CLUSTER.PodInTable[],
  healthyPods: CLUSTER.PodInTable[],
  notHealthyPods: CLUSTER.PodInTable[],
  images: Set<string>
}

const pollingInterval = 5000;
const pendingState = 'pending'

export default () => {

  const intl = useIntl();
  const {initialState} = useModel('@@initialState');
  const {successAlert} = useModel('alert')
  const {id, fullPath, type} = initialState!.resource;
  const [current, setCurrent] = useState(0);
  const [stepStatus, setStepStatus] = useState<'wait' | 'process' | 'finish' | 'error'>('wait');
  const [task, setTask] = useState(RunningTask.NONE);
  const [pipelinerunID, setPipelinerunID] = useState<number>();
  const [podsInfo, setPodsInfo] = useState<PodsInfo>({
    newPods: [],
    oldPods: [],
    healthyPods: [],
    notHealthyPods: [],
    images: new Set<string>()
  })
  const [steps, setSteps] = useState([
    {
      title: '构建中',
      content: <div/>,
      icon: loading
    },
    {
      title: '待发布',
      content: <div/>,
      icon: waiting
    },
  ]);

  const {data: cluster} = useRequest(() => getCluster(id), {
    refreshDeps: [id],
    ready: !!id && type === ResourceType.CLUSTER,
  });
  const {data: buildLog, run: refreshBuildLog} = useRequest(() => queryPipelineLog(pipelinerunID!), {
    manual: true,
    refreshDeps: [pipelinerunID],
    formatResult: (res) => {
      return res
    }
  })
  const refreshPodsInfo = (data: CLUSTER.ClusterStatus) => {
    const oldPods: CLUSTER.PodInTable[] = []
    const newPods: CLUSTER.PodInTable[] = []
    const healthyPods: CLUSTER.PodInTable[] = []
    const notHealthyPods: CLUSTER.PodInTable[] = []
    const images = new Set<string>()

    const {podTemplateHash, versions} = data.clusterStatus;
    if (versions) {
      Object.keys(versions).forEach(version => {
        // filter new/old pods
        const versionObj = versions[version]
        const {pods} = versionObj
        if (pods) {
          Object.keys(pods).forEach(podName => {
            const podObj = versionObj.pods[podName]
            const {status, spec, metadata} = podObj
            const {containers, initContainers} = spec
            const {namespace, creationTimestamp} = metadata
            const {containerStatuses} = status
            const state = (containerStatuses && containerStatuses.length > 0) ? containerStatuses[0].state.state : pendingState

            const podInTable: CLUSTER.PodInTable = {
              key: podName,
              podName,
              status: state,
              createTime: Utils.timeToLocal(creationTimestamp),
              ip: status.podIP,
              onlineStatus: containerStatuses[0].ready ? 'online' : 'offline',
              restartCount: containerStatuses[0].restartCount,
              containerName: containers[0].name,
              namespace
            };
            if (state === 'running') {
              healthyPods.push(podInTable)
            } else {
              notHealthyPods.push(podInTable)
            }
            if (podTemplateHash === version) {
              newPods.push(podInTable)
              containers.forEach(item => images.add(item.image))
              initContainers.forEach(item => images.add(item.image))
            } else {
              oldPods.push(podInTable)
            }
            return podInTable;
          });
        }
      });
    }

    setPodsInfo({
      newPods,
      oldPods,
      healthyPods,
      notHealthyPods,
      images
    })
  }
  const {data: statusData} = useRequest(() => getClusterStatus(id), {
    pollingInterval,
    refreshDeps: [id],
    ready: !!id && type === ResourceType.CLUSTER,
    onSuccess: () => {
      if (statusData) {
        refreshPodsInfo(statusData)

        const {task: t, taskStatus} = statusData.runningTask;
        const tt = t as RunningTask
        setTask(tt)
        if (tt === RunningTask.NONE) {
          return
        }

        const {step} = statusData.clusterStatus;
        const tStatus = taskStatus as TaskStatus;
        const entity = taskStatus2Entity.get(tStatus)
        setPipelinerunID(statusData.runningTask.pipelinerunID)
        if (tt === RunningTask.BUILD) {
          // refresh build log when in build task
          refreshBuildLog()
          steps[0] = {
            title: entity!.buildTitle,
            content: <BuildPage log={buildLog}/>,
            icon: entity!.icon,
          }
        }
        if (tt === RunningTask.DEPLOY) {
          const succeed = taskStatus2Entity.get(TaskStatus.SUCCEEDED)
          steps[0] = {
            title: succeed!.buildTitle,
            content: <BuildPage log={buildLog}/>,
            icon: smile,
          }
          steps[1] = {
            title: entity!.deployTitle,
            content: <DeployPage step={step} onNext={() => {
              next(id).then(() => {
                successAlert('下一批次开始发布')
              })
            }
            } onCancel={() => {
              cancelPipeline(pipelinerunID!).then(() => {
                successAlert('取消发布成功')
              })
            }
            }/>,
            icon: entity!.icon,
          }
          setCurrent(1)
        }
        setSteps(steps)
        setStepStatus(entity!.stepStatus);
      }
    }
  });

  function BuildPage({log}: { log: string }) {
    return <div>
      <div style={{marginBottom: '10px', fontSize: '16px', fontWeight: 'bold'}}>构建日志</div>
      <CodeEditor
        content={log}
      />
    </div>
  }

  function DeployStep({index, total}: { index: number, total: number }) {
    const s = []
    for (let i = 0; i < total; i += 1) {
      s.push({
        title: `阶段${i + 1}`
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

  function DeployPage({step, onNext, onCancel}: DeployPageProps) {
    const {index, total} = step
    return <div title={"发布阶段"}>
      <DeployStep {...step}/>
      <div style={{textAlign: 'center'}}>
        {
          index < total && statusData?.clusterStatus.status === ClusterStatus.SUSPENDED &&
          <Button style={{margin: '0 8px'}} onClick={onNext}>
            下一步
          </Button>
        }

        <Button danger style={{margin: '0 8px'}} onClick={onCancel}>
          取消发布
        </Button>
      </div>
    </div>
  }

  const inPublishing = task !== RunningTask.NONE
  const currentPodsTabTitle = inPublishing ? 'New Pods' : 'Pods'
  const oldPodsTitle = 'Old Pods';
  const formatTabTitle = (title: string, length: number) => {
    return <div>
      {title}<span className={styles.tabNumber}>{length}</span>
    </div>
  };

  const baseInfo: Param[][] = [
    [
      {
        key: 'Pods数量',
        value: {
          Health: podsInfo.healthyPods.length,
          NotHealth: podsInfo.notHealthyPods.length,
        }
      }
    ],
    [
      {
        key: '集群状态',
        value: statusData?.clusterStatus.status || ClusterStatus.NOTFOUND,
      },
    ],
    [
      {
        key: 'Git Repo',
        value: {
          URL: cluster?.git.url || '',
          branch: cluster?.git.branch || '',
        }
      }
    ],
    [
      {
        key: 'Images',
        value: Array.from(podsInfo.images),
      }
    ]
  ]

  if (cluster?.latestDeployedCommit) {
    baseInfo[2][0]['value']['commit'] = cluster!.latestDeployedCommit
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
        Modal.info({
          title: 'Are you sure to restart all pods?',
          onOk() {
            restart(id).then(() => {
              successAlert('Restart All Pods Succeed')
            })
          },
        });
        break;
      default:

    }
  }

  const operateDropdown = <Menu onClick={onClickOperation}>
    <Menu.Item key="builddeploy">构建发布</Menu.Item>
    <Menu.Item key="deploy">直接发布</Menu.Item>
    <Menu.Item key="restart">重新启动</Menu.Item>
    <Menu.Item key="rollback">回滚</Menu.Item>
  </Menu>;

  return (
    <PageWithBreadcrumb>
      <div>
        <div style={{marginBottom: '5px', textAlign: 'right'}}>
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
        inPublishing && (
          <Row>
            <Col span={4}>
              <HSteps current={current} status={stepStatus} steps={steps} onChange={setCurrent}/>
            </Col>
            <Col span={20}>
              <div className={styles.stepsContent}>{steps[current].content}</div>
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
        inPublishing && <Tabs size={'large'}>
          <TabPane tab={formatTabTitle(oldPodsTitle, podsInfo.oldPods.length)}>
            <PodsTable data={podsInfo.oldPods} cluster={cluster!}/>
          </TabPane>
        </Tabs>
      }
    </PageWithBreadcrumb>
  )
};
