import {Button, Col, notification, Row, Steps, Tabs} from "antd";
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb'
import {useIntl} from "@@/plugin-locale/localeExports";
import {useModel} from "@@/plugin-model/useModel";
import {useRequest} from "@@/plugin-request/request";
import PodsTable from './PodsTable'
import {getCluster, getClusterStatus, next} from "@/services/clusters/clusters";
import {useState} from 'react';
import {FrownOutlined, HourglassOutlined, LoadingOutlined, SmileOutlined} from "@ant-design/icons";
import {RunningTask, TaskStatus} from "@/const";
import styles from './index.less';
import {cancelPipeline} from "@/services/pipelineruns/pipelineruns";

const {TabPane} = Tabs;
const {Step} = Steps;
const smile = <SmileOutlined/>
const loading = <LoadingOutlined/>
const frown = <FrownOutlined/>
const waiting = <HourglassOutlined/>

const mapTaskStatus2Icon = new Map();
mapTaskStatus2Icon.set(TaskStatus.RUNNING.toString(), loading)
mapTaskStatus2Icon.set(TaskStatus.SUCCEEDED.toString(), smile)
mapTaskStatus2Icon.set(TaskStatus.FAILED.toString(), frown)

const mapTaskStatus2BuildTitle = new Map();
mapTaskStatus2BuildTitle.set(TaskStatus.RUNNING.toString(), '构建中...')
mapTaskStatus2BuildTitle.set(TaskStatus.SUCCEEDED.toString(), '构建完成')
mapTaskStatus2BuildTitle.set(TaskStatus.FAILED.toString(), '构建失败')

const mapTaskStatus2DeployTitle = new Map();
mapTaskStatus2DeployTitle.set(TaskStatus.RUNNING.toString(), '发布中...')
mapTaskStatus2DeployTitle.set(TaskStatus.SUCCEEDED.toString(), '发布完成')
mapTaskStatus2DeployTitle.set(TaskStatus.FAILED.toString(), '发布失败')

const mapTaskStatus2StepStatus = new Map();
mapTaskStatus2StepStatus.set(TaskStatus.RUNNING.toString(), 'process')
mapTaskStatus2StepStatus.set(TaskStatus.SUCCEEDED.toString(), 'finish')
mapTaskStatus2StepStatus.set(TaskStatus.FAILED.toString(), 'error')

export default () => {

  const intl = useIntl();
  const {initialState} = useModel('@@initialState');
  const {id} = initialState!.resource;
  const [current, setCurrent] = useState(0);
  const [stepStatus, setStepStatus] = useState();
  const [task, setTask] = useState(RunningTask.NONE.toString());
  const [steps, setSteps] = useState([
    {
      title: '待构建',
      content: <div/>,
      icon: waiting
    },
    {
      title: '待发布',
      content: <div/>,
      icon: waiting
    },
  ]);

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

  function DeployPage({step, onNext, onCancel}: {step: {index: number, total: number}, onNext: () => void, onCancel: () => void}) {
    return <div>
      <DeployStep {...step}/>
      <div>
        <Button style={{margin: '0 8px'}} onClick={onNext}>
          下一步
        </Button>
        <Button style={{margin: '0 8px'}} onClick={onCancel}>
          取消发布
        </Button>
      </div>
    </div>
  }

  const {data: cluster} = useRequest(() => getCluster(id));
  const {data: status} = useRequest(() => getClusterStatus(id), {
    pollingInterval: 6000,
    onSuccess: () => {
      if (status) {
        const {task: t, taskStatus} = status.runningTask;
        const {step} = status.clusterStatus;

        setTask(t)
        const icon = mapTaskStatus2Icon.get(taskStatus)
        if (t === RunningTask.BUILD.toString()) {
          const title = mapTaskStatus2BuildTitle.get(taskStatus)
          steps[0] = {
            title,
            content: <div/>,
            icon
          }
        }
        if (t === RunningTask.DEPLOY.toString()) {
          steps[0] = {
            title: mapTaskStatus2BuildTitle.get(TaskStatus.SUCCEEDED.toString()),
            content: <div/>,
            icon: mapTaskStatus2Icon.get(TaskStatus.SUCCEEDED.toString()),
          }
          const title = mapTaskStatus2StepStatus.get(taskStatus)

          steps[1] = {
            title,
            content: <DeployPage step={step} onNext={onNext} onCancel={onCancel}/>,
            icon
          }
          setCurrent(1)
        }
        setSteps(steps)
        setStepStatus(mapTaskStatus2StepStatus.get(taskStatus))
      }
    }
  });

  const onNext = () => {
    next(id).then(() => {
      notification.success({
        message: '下一批次开始发布',
      });
    })
  }
  const onCancel = () => {
    cancelPipeline(status!.runningTask.pipelinerunID).then(() => {
      notification.success({
        message: '取消发布成功',
      });
    })
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

  return (
    <PageWithBreadcrumb>
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
}
