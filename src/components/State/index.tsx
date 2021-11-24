import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  DisconnectOutlined,
  HourglassOutlined,
  LoadingOutlined,
  QuestionOutlined,
  RetweetOutlined,
  StopOutlined
} from "@ant-design/icons";
import {ClusterStatus} from "@/const";
import {history} from 'umi';
import './index.less'

interface StatusProps {
  text?: string
  link?: string
}

// state for clusterStatus and pipeline status
const Succeeded = (props: StatusProps) => {
  const {text, link} = props;
  const txt = <span className="ci-status ci-success"><CheckCircleOutlined/> {text || 'Succeeded'}</span>
  return <div>
    {
      link ? <a onClick={() => history.push(link)} className="ci-status ci-success">{txt}</a> : txt
    }
  </div>
}

const Failed = (props: StatusProps) => {
  const {text, link} = props;
  const txt = <span className="ci-status ci-failed"><CloseCircleOutlined/> {text || 'Failed'}</span>
  return <div>
    {
      link ? <a onClick={() => history.push(link)} className="ci-status ci-failed">{txt}</a> : txt
    }
  </div>
}

const Cancelled = (props: StatusProps) => {
  const {text, link} = props;
  const txt = <span className="ci-status ci-cancelled"><StopOutlined/> {text || 'Cancelled'}</span>
  return <div>
    {
      link ? <a onClick={() => history.push(link)} className="ci-status ci-cancelled">{txt}</a> : txt
    }
  </div>
}

const Progressing = (props: StatusProps) => {
  const {text, link} = props;
  const txt = <span className="ci-status ci-progressing"><LoadingOutlined/> {text || 'Progressing'}</span>
  return <div>
    {
      link ? <a onClick={() => history.push(link)} className="ci-status ci-progressing">{txt}</a> : txt
    }
  </div>
}

const Suspended = (props: StatusProps) => {
  const {text} = props;
  const txt = <span className="ci-status ci-suspended"><HourglassOutlined/> {text || 'Suspended'}</span>
  return <div>
    {txt}
  </div>
}

const NotFount = (props: StatusProps) => {
  const {text} = props;
  const txt = <span className="ci-status ci-notfound"><QuestionOutlined/> {text || 'NotFound'}</span>
  return <div>
    {txt}
  </div>
}

const Freeing = (props: StatusProps) => {
  const {text} = props;
  const txt = <span className="ci-status ci-freeing"><RetweetOutlined/> {text || 'Freeing'}</span>
  return <div>
    {txt}
  </div>
}

const Freed = (props: StatusProps) => {
  const {text} = props;
  const txt = <span className="ci-status ci-freed"><DisconnectOutlined/> {text || 'Freed'}</span>
  return <div>
    {txt}
  </div>
}

const Deleting = (props: StatusProps) => {
  const {text} = props;
  const txt = <span className="ci-status ci-deleting"><DeleteOutlined/> {text || 'Deleting'}</span>
  return <div>
    {txt}
  </div>
}

// state for pods
const Running = (props: StatusProps) => {
  const {text} = props;
  return <span className="badge-color-green badge-content">
    {text || 'Running'}
  </span>
}

const Waiting = (props: StatusProps) => {
  const {text} = props;
  return <span className="badge-color-yellow badge-content">
    {text || 'Waiting'}
  </span>
}

const Pending = (props: StatusProps) => {
  const {text} = props;
  return <span className="badge-color-yellow badge-content">
    {text || 'Pending'}
  </span>
}

const Terminated = (props: StatusProps) => {
  const {text} = props;
  return <span className="badge-color-red badge-content">
    {text || 'Terminated'}
  </span>
}

// state for oline status
const Online = (props: StatusProps) => {
  const {text} = props;
  return <span className="badge-color-blue badge-content">
    {text || 'Online'}
  </span>
}

const Offline = (props: StatusProps) => {
  const {text} = props;
  return <span className="badge-color-brown badge-content">
    {text || 'Offline'}
  </span>
}

// getStatusComponent returns the status component
const getStatusComponent = (status: any) => {
  switch (status) {
    case ClusterStatus.PROGRESSING:
      return <Progressing/>
    case ClusterStatus.HEALTHY:
      return <Succeeded text={'Healthy'}/>
    case ClusterStatus.DEGRADED:
      return <Failed text={'NotHealthy'}/>
    case ClusterStatus.SUSPENDED:
      return <Progressing/>
    case ClusterStatus.FREEING:
      return <Freeing/>
    case ClusterStatus.FREED:
      return <Freed/>
    case ClusterStatus.DELETING:
      return <Deleting/>
    default:
      return <NotFount/>
  }
}

// isRestrictedStatus indicates if status is freeing or deleting
const isRestrictedStatus = (status: string) => {
  switch (status) {
    case ClusterStatus.FREEING:
    case ClusterStatus.DELETING:
      return true
  }
  return false
}

export {
  Succeeded,
  Failed,
  Progressing,
  Suspended,
  NotFount,
  Running,
  Online,
  Waiting,
  Offline,
  Terminated,
  Pending,
  Cancelled,
  Freeing,
  Freed,
  Deleting,
  getStatusComponent,
  isRestrictedStatus,
}
