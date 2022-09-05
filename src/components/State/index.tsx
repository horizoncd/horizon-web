import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  DisconnectOutlined,
  HourglassOutlined,
  LoadingOutlined,
  QuestionOutlined,
  RetweetOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { ClusterStatus } from '@/const';
import { history } from 'umi';
import './index.less';
import { Tooltip } from 'antd';

interface StatusProps {
  text?: string
  link?: string
  message?: string
}

// state for clusterStatus and pipeline status
const Succeeded = (props: StatusProps) => {
  const { text, link } = props;
  const txt = (
    <span className="ci-status ci-success">
      <CheckCircleOutlined />
      {' '}
      {text || 'Succeeded'}
    </span>
  );
  return (
    <div>
      {
      link ? <a onClick={() => history.push(link)} className="ci-status ci-success">{txt}</a> : txt
    }
    </div>
  );
};

const Failed = (props: StatusProps) => {
  const { text, link } = props;
  const txt = (
    <span className="ci-status ci-failed">
      <CloseCircleOutlined />
      {' '}
      {text || 'Failed'}
    </span>
  );
  return (
    <div>
      {
      link ? <a onClick={() => history.push(link)} className="ci-status ci-failed">{txt}</a> : txt
    }
    </div>
  );
};

const Cancelled = (props: StatusProps) => {
  const { text, link } = props;
  const txt = (
    <span className="ci-status ci-cancelled">
      <StopOutlined />
      {' '}
      {text || 'Cancelled'}
    </span>
  );
  return (
    <div>
      {
      link ? <a onClick={() => history.push(link)} className="ci-status ci-cancelled">{txt}</a> : txt
    }
    </div>
  );
};

const Progressing = (props: StatusProps) => {
  const { text, link } = props;
  const txt = (
    <span className="ci-status ci-progressing">
      <LoadingOutlined />
      {' '}
      {text || 'Progressing'}
    </span>
  );
  return (
    <div>
      {
      link ? <a onClick={() => history.push(link)} className="ci-status ci-progressing">{txt}</a> : txt
    }
    </div>
  );
};

const Suspended = (props: StatusProps) => {
  const { text } = props;
  const txt = (
    <span className="ci-status ci-suspended">
      <HourglassOutlined />
      {' '}
      {text || 'Suspended'}
    </span>
  );
  return (
    <div>
      {txt}
    </div>
  );
};

const NotFount = (props: StatusProps) => {
  const { text } = props;
  const txt = (
    <span className="ci-status ci-notfound">
      <QuestionOutlined />
      {' '}
      {text || 'NotFound'}
    </span>
  );
  return (
    <div>
      {txt}
    </div>
  );
};

const Freeing = (props: StatusProps) => {
  const { text } = props;
  const txt = (
    <span className="ci-status ci-freeing">
      <RetweetOutlined />
      {' '}
      {text || 'Freeing'}
    </span>
  );
  return (
    <div>
      {txt}
    </div>
  );
};

const Creating = (props: StatusProps) => {
  const { text } = props;
  const txt = (
    <span className="ci-status ci-creating">
      <LoadingOutlined />
      {' '}
      {text || 'Creating'}
    </span>
  );
  return (
    <div>
      {txt}
    </div>
  );
};

const Freed = (props: StatusProps) => {
  const { text } = props;
  const txt = (
    <span className="ci-status ci-freed">
      <DisconnectOutlined />
      {' '}
      {text || 'Freed'}
    </span>
  );
  return (
    <div>
      {txt}
    </div>
  );
};

const Deleting = (props: StatusProps) => {
  const { text } = props;
  const txt = (
    <span className="ci-status ci-deleting">
      <DeleteOutlined />
      {' '}
      {text || 'Deleting'}
    </span>
  );
  return (
    <div>
      {txt}
    </div>
  );
};

// state for pods
const PodRunning = (props: StatusProps) => {
  const { text } = props;
  return (
    <span className="badge-color-green badge-content">
      {text}
    </span>
  );
};

const PodPending = (props: StatusProps) => {
  const { text, message } = props;
  return (
    <Tooltip title={message}>
      <span className="badge-color-yellow badge-content">
        {text}
      </span>
    </Tooltip>
  );
};

const PodError = (props: StatusProps) => {
  const { text, message } = props;
  return (
    <Tooltip title={message}>
      <span className="badge-color-red badge-content">
        {text}
      </span>
    </Tooltip>
  );
};

// state for oline status
const Online = (props: StatusProps) => {
  const { text } = props;
  return (
    <span className="badge-color-blue badge-content">
      {text || 'Online'}
    </span>
  );
};

const Offline = (props: StatusProps) => {
  const { text } = props;
  return (
    <span className="badge-color-brown badge-content">
      {text || 'Offline'}
    </span>
  );
};

// getStatusComponent returns the status component
const getStatusComponent = (status: any) => {
  switch (status) {
    case ClusterStatus.CREATING:
      return <Creating text="创建中" />;
    case ClusterStatus.PROGRESSING:
      return <Progressing text="发布中" />;
    case ClusterStatus.HEALTHY:
      return <Succeeded text="正常" />;
    case ClusterStatus.DEGRADED:
      return <Failed text="异常" />;
    case ClusterStatus.SUSPENDED:
      return <Suspended text="批次暂停" />;
    case ClusterStatus.FREEING:
      return <Freeing text="释放中" />;
    case ClusterStatus.FREED:
      return <Freed text="已释放" />;
    case ClusterStatus.DELETING:
      return <Deleting text="删除中" />;
    case ClusterStatus.NOTFOUND:
      return <NotFount text="未发布" />;
    case ClusterStatus.MANUALPAUSED:
      return <Suspended text="人工暂停" />;
    default:
      return <NotFount text="未知" />;
  }
};

// isRestrictedStatus indicates if status is freeing or deleting
const isRestrictedStatus = (status: string) => {
  switch (status) {
    case ClusterStatus.CREATING:
    case ClusterStatus.FREEING:
    case ClusterStatus.DELETING:
      return true;
    default:
      return false;
  }
};

export {
  Succeeded,
  Failed,
  Progressing,
  Suspended,
  NotFount,
  PodRunning,
  Online,
  Offline,
  PodPending,
  Cancelled,
  Freeing,
  Freed,
  Deleting,
  getStatusComponent,
  isRestrictedStatus,
  PodError,
};
