import {Button, Col, Dropdown, Menu, notification, Row, Steps, Tabs} from "antd";
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb'
import {useIntl} from "@@/plugin-locale/localeExports";
import {useModel} from "@@/plugin-model/useModel";
import {useRequest} from "@@/plugin-request/request";
import PodsTable from './PodsTable'
import {getCluster, getClusterStatus, next} from "@/services/clusters/clusters";
import {useState} from 'react';
import HSteps from '@/components/HSteps'
import {DownOutlined, FrownOutlined, HourglassOutlined, LoadingOutlined, SmileOutlined} from "@ant-design/icons";
import {PublishType, RunningTask, TaskStatus} from "@/const";
import styles from './index.less';
import {cancelPipeline, queryPipelineLog} from "@/services/pipelineruns/pipelineruns";
import CodeEditor from "@/components/CodeEditor";
import type {Param} from "@/components/DetailCard";
import DetailCard from "@/components/DetailCard";
import {history} from 'umi';
import {stringify} from "querystring";

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

const pollingInterval = 0;
export default () => {

  const intl = useIntl();
  const {initialState} = useModel('@@initialState');
  const {id, fullPath} = initialState!.resource;
  const [current, setCurrent] = useState(0);
  const [stepStatus, setStepStatus] = useState<'wait' | 'process' | 'finish' | 'error'>('wait');
  const [task, setTask] = useState(RunningTask.NONE);
  const [pipelinerunID, setPipelinerunID] = useState<number>();
  const [steps, setSteps] = useState([
    {
      title: '构建中',
      content: <BuildPage log={'This a test\n1\n2\n3\n4\n1\n2\n3\n4\n5'}/>,
      icon: loading
    },
    {
      title: '待发布',
      content: <DeployPage step={{total: 4, index: 1}} onNext={() => {
        next(id).then(() => {
          notification.success({
            message: '下一批次开始发布',
          });
        })
      }
      } onCancel={() => {
        cancelPipeline(pipelinerunID!).then(() => {
          notification.success({
            message: '取消发布成功',
          });
        })
      }
      }/>,
      icon: waiting
    },
  ]);

  const {data: cluster} = useRequest(() => getCluster(id));
  const {data: buildLog, run: refreshBuildLog} = useRequest(() => queryPipelineLog(pipelinerunID!), {
    manual: true
  })
  const {data: clusterStatus} = useRequest(() => getClusterStatus(id), {
    pollingInterval,
    onSuccess: () => {
      if (clusterStatus) {
        const {task: t, taskStatus} = clusterStatus.runningTask;
        const {step} = clusterStatus.clusterStatus;
        setPipelinerunID(clusterStatus.runningTask.pipelinerunID)
        const tt = t as RunningTask
        setTask(tt)

        const tStatus = taskStatus as TaskStatus
        const entity = taskStatus2Entity.get(tStatus)
        if (tt === RunningTask.BUILD) {
          steps[0] = {
            title: entity!.buildTitle,
            content: <BuildPage log={buildLog}/>,
            icon: entity!.icon,
          }
          // refresh build log when in build task
          refreshBuildLog()
        }
        if (tt === RunningTask.DEPLOY) {
          const succeed = taskStatus2Entity.get(TaskStatus.SUCCEEDED)
          steps[0] = {
            title: succeed!.buildTitle,
            content: <div/>,
            icon: smile,
          }
          steps[1] = {
            title: entity!.deployTitle,
            content: <DeployPage step={step} onNext={() => {
              next(id).then(() => {
                notification.success({
                  message: '下一批次开始发布',
                });
              })
            }
            } onCancel={() => {
              cancelPipeline(pipelinerunID!).then(() => {
                notification.success({
                  message: '取消发布成功',
                });
              })
            }
            }/>,
            icon: entity!.icon,
          }
          setCurrent(1)
        }
        setSteps(steps)
        setStepStatus(entity!.stepStatus)
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
    return <Steps current={index - 1}>
      {s.map((item, idx) => {
        let icon;
        if (idx < index) {
          icon = smile
        } else if (idx === index) {
          icon = loading
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
          index < total &&
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

  const oldPods: CLUSTER.PodInTable[] = []
  const newPods: CLUSTER.PodInTable[] = []
  const healthyPods: CLUSTER.PodInTable[] = []
  const notHealthyPods: CLUSTER.PodInTable[] = []
  const images = new Set<string>()

  if (clusterStatus) {
    const {podTemplateHash, versions} = clusterStatus.clusterStatus;

    Object.keys(versions).forEach(version => {
      // filter new/old pods
      const versionObj = versions[version]
      Object.keys(versionObj.pods).forEach(podName => {
        const podObj = versionObj.pods[podName]
        const {status, spec, metadata} = podObj
        const {containers, initContainers} = spec
        const {namespace} = metadata
        const {containerStatuses} = status
        const {state} = containerStatuses[0].state

        const podInTable: CLUSTER.PodInTable = {
          podName,
          status: state,
          createTime: "",
          ip: status.podIP,
          onlineStatus: containerStatuses[0].ready ? 'online' : 'offline',
          restartCount: 0,
          containerName: containers[0].name,
          namespace
        };
        if (state === 'Running') {
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
      })
    })
  }

  const currentPodsTabTitle = oldPods.length === 0 ? 'New Pods' : 'Pods'
  const oldPodsTitle = 'Old Pods';
  const formatTabTitle = (title: string, pods: CLUSTER.PodInTable[]) => {
    return `${title} (${pods.length})`
  };

  const baseInfo: Param[][] = [
    [
      {
        key: 'Pods数量',
        value: {
          Health: healthyPods.length,
          NotHealth: notHealthyPods.length,
        }
      }
    ],
    [
      {
        key: '集群状态',
        value: clusterStatus?.clusterStatus.status || 'Running',
      },
    ],
    [
      {
        key: 'Git Repo',
        value: {
          URL: cluster?.git.url || '',
          branch: cluster?.git.branch || '',
          commit: cluster?.git.commit || '',
        }
      }
    ],
    [
      {
        key: 'Images',
        value: Array.from(images)
      }
    ]
  ]

  const onClickOperation = ({key}: { key: string }) => {
    switch (key) {
      case '1':
        history.push({
          pathname: `/clusters${fullPath}/-/pipelines/new`,
          search: stringify({
            type: PublishType.BUILD_DEPLOY,
          })
        })
        break;
      case '2':
        break;
      case '3':
        break;
      default:

    }
  }

  const operateDropdown = (
    <Menu onClick={onClickOperation}>
      <Menu.Item key="1">构建发布</Menu.Item>
      <Menu.Item key="2">直接发布</Menu.Item>
      <Menu.Item key="3">重新启动</Menu.Item>
      <Menu.Item key="4">回滚</Menu.Item>
    </Menu>
  );

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
        (
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
        <TabPane tab={formatTabTitle(currentPodsTabTitle, newPods)}>
          <PodsTable data={newPods} theCluster={cluster!}/>
        </TabPane>
      </Tabs>

      {
        <Tabs size={'large'}>
          <TabPane tab={formatTabTitle(oldPodsTitle, oldPods)}>
            <PodsTable data={oldPods} theCluster={cluster!}/>
          </TabPane>
        </Tabs>
      }
    </PageWithBreadcrumb>
  )
};
