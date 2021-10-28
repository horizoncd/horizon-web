import {Button, Card, Col, notification, Row, Steps, Tabs} from "antd";
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb'
import {useIntl} from "@@/plugin-locale/localeExports";
import {useModel} from "@@/plugin-model/useModel";
import {useRequest} from "@@/plugin-request/request";
import PodsTable from './PodsTable'
import {getCluster, getClusterStatus, next} from "@/services/clusters/clusters";
import {useState} from 'react';
import {
  CopyOutlined,
  FrownOutlined,
  HourglassOutlined,
  LoadingOutlined,
  SmileOutlined
} from "@ant-design/icons";
import {RunningTask, TaskStatus} from "@/const";
import styles from './index.less';
import {cancelPipeline, queryPipelineLog} from "@/services/pipelineruns/pipelineruns";
import CodeEditor from "@/components/CodeEditor";
import copy from "copy-to-clipboard";
import styles2 from '@/pages/clusters/pipelines/Detail/index.less'
import type {Param} from "@/components/DetailCard";
import DetailCard from "@/components/DetailCard";

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

const pollingInterval = 6000;
export default () => {

  const intl = useIntl();
  const {initialState} = useModel('@@initialState');
  const {id} = initialState!.resource;
  const [current, setCurrent] = useState(0);
  const [stepStatus, setStepStatus] = useState<'wait' | 'process' | 'finish' | 'error'>('wait');
  const [task, setTask] = useState(RunningTask.NONE);
  const [pipelinerunID, setPipelinerunID] = useState<number>();
  const [steps, setSteps] = useState([
    {
      title: '',
      content: <div/>,
      icon: waiting
    },
    {
      title: '',
      content: <div/>,
      icon: waiting
    },
  ]);

  const {data: cluster} = useRequest(() => getCluster(id));
  const {data: buildLog, run: refreshBuildLog} = useRequest(() => queryPipelineLog(pipelinerunID!), {
    manual: true
  })
  const {data: status} = useRequest(() => getClusterStatus(id), {
    pollingInterval,
    onSuccess: () => {
      if (status) {
        const {task: t, taskStatus} = status.runningTask;
        const {step} = status.clusterStatus;
        setPipelinerunID(status.runningTask.pipelinerunID)
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

  const onCopyClick = () => {
    if (copy(buildLog)) {
      notification.success({message: "复制成功"})
    } else {
      notification.success({message: "复制失败"})
    }
  }

  function BuildPage({log}: { log: string }) {
    return <div>
      <Card
        title={"构建日志"}
        tabBarExtraContent={(
          <div>
            <Button className={styles2.buttonClass}>
              <CopyOutlined className={styles2.iconCommonModal} onClick={onCopyClick}/>
            </Button>
          </div>
        )}
      >
        <CodeEditor
          content={log}
        />
      </Card>
    </div>
  }

  function DeployStep({index, total}: { index: number, total: number }) {
    const s = []
    for (let i = 0; i < total; i += 1) {
      s.push({
        title: `阶段${index}`
      })
    }
    return <Steps current={index}>
      {s.map((item, idx) => {
        let icon;
        if (idx < total) {
          icon = smile
        } else if (idx === total) {
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
    return <Card title={"发布阶段"}>
      <DeployStep {...step}/>
      <div>
        {
          index < total &&
          <Button style={{margin: '0 8px'}} onClick={onNext}>
            下一步
          </Button>
        }

        <Button style={{margin: '0 8px'}} onClick={onCancel}>
          取消发布
        </Button>
      </div>
    </Card>
  }

  const oldPods: CLUSTER.PodInTable[] = []
  const newPods: CLUSTER.PodInTable[] = []

  if (status) {
    const {podTemplateHash} = status.clusterStatus;

    Object.keys(status.clusterStatus.versions).forEach(version => {
      // filter new/old pods
      const versionObj = status.clusterStatus.versions[version]
      const podInTables = Object.keys(versionObj.pods).map(podName => {
        const podObj = versionObj.pods[podName]
        const podInTable: CLUSTER.PodInTable = {
          podName,
          status: podObj.status.containerStatuses[0].state.state,
          createTime: "",
          ip: podObj.status.podIP,
          onlineStatus: podObj.status.containerStatuses[0].ready ? 'online' : 'offline',
          restartCount: 0,
          containerName: podObj.spec.containers[0].name,
          namespace: podObj.metadata.namespace
        }
        return podInTable;
      })
      if (podTemplateHash === version) {
        newPods.push(...podInTables)
      } else {
        oldPods.push(...podInTables)
      }
    })
  }

  const currentPodsTabTitle = oldPods.length ? 'New Pods' : 'Pods'
  const oldPodsTitle = 'Old Pods';
  const formatTabTitle = (title: string, pods: CLUSTER.PodInTable[]) => {
    return `${title}(${pods.length})`
  };

  const data: Param[][] = [
    [
      {
        key: '集群状态',
        value: status?.clusterStatus.status || '',
      },
    ],
    [
      {
        key: 'Git Repo',
        value: {
          URL: cluster!.git.url,
          branch: cluster!.git.branch,
          commit: cluster!.git.commit,
        }
      }
    ],
  ]

  return (
    <PageWithBreadcrumb>
      <DetailCard
        title={<span>基础信息</span>}
        data={data}
      />

      {
        task !== RunningTask.NONE.toString() && (
          <Row>
            <Col span={4}>
              <Steps current={current} status={stepStatus} direction={"vertical"}>
                {steps.map(item => (
                  <Step key={item.title} title={item.title}/>
                ))}
              </Steps>
            </Col>
            <Col>
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
        oldPods.length &&
        <Tabs size={'large'}>
          <TabPane tab={formatTabTitle(oldPodsTitle, oldPods)}>
            <PodsTable data={oldPods} theCluster={cluster!}/>
          </TabPane>
        </Tabs>
      }
    </PageWithBreadcrumb>
  )
};
