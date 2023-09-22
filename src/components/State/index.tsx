import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  DisconnectOutlined,
  HourglassOutlined,
  LoadingOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  QuestionOutlined,
  RetweetOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { Link, useIntl } from 'umi';
import './index.less';
import { Tooltip } from 'antd';
import { ClusterStatus } from '@/const';

interface StatusProps {
  text?: string
  link?: string
  message?: string
}

// state for clusterStatus and pipeline status
const Succeeded = (props: Omit<StatusProps, 'message'>) => {
  const { text, link } = props;

  const intl = useIntl();

  const txt = (
    <span className="ci-status ci-success">
      <CheckCircleOutlined />
      {' '}
      {text || intl.formatMessage({ id: 'pages.cluster.status.succeeded' })}
    </span>
  );
  return (
    <div>
      {
      link ? <Link to={link} className="ci-status ci-success">{txt}</Link> : txt
    }
    </div>
  );
};

const Failed = (props: Omit<StatusProps, 'message'>) => {
  const { text, link } = props;

  const intl = useIntl();

  const txt = (
    <span className="ci-status ci-failed">
      <CloseCircleOutlined />
      {' '}
      {text || intl.formatMessage({ id: 'pages.cluster.status.failed' })}
    </span>
  );
  return (
    <div>
      {
      link ? <Link to={link} className="ci-status ci-failed">{txt}</Link> : txt
    }
    </div>
  );
};

const Cancelled = (props: Omit<StatusProps, 'message'>) => {
  const { text, link } = props;

  const intl = useIntl();

  const txt = (
    <span className="ci-status ci-cancelled">
      <StopOutlined />
      {' '}
      {text || intl.formatMessage({ id: 'pages.cluster.status.canceled' })}
    </span>
  );
  return (
    <div>
      {
      link ? <Link to={link} className="ci-status ci-cancelled">{txt}</Link> : txt
    }
    </div>
  );
};

const Ready = (props: Omit<StatusProps, 'message'>) => {
  const { text, link } = props;

  const intl = useIntl();

  const txt = (
    <span>
      <PlayCircleOutlined />
      {' '}
      {text || intl.formatMessage({ id: 'pages.cluster.status.ready' })}
    </span>
  );

  return (
    <div>
      {
      link ? <Link to={link}>{txt}</Link> : txt
    }
    </div>
  );
};

const Pending = (props: Omit<StatusProps, 'message'>) => {
  const { text, link } = props;

  const intl = useIntl();

  const txt = (
    <span style={{ color: 'orange' }}>
      <PauseCircleOutlined />
      {' '}
      {text || intl.formatMessage({ id: 'pages.cluster.status.pending' })}
    </span>
  );

  return (
    <div>
      {
      link ? <Link to={link}>{txt}</Link> : txt
    }
    </div>
  );
};

const Progressing = (props: Omit<StatusProps, 'message'>) => {
  const { text, link } = props;

  const intl = useIntl();

  const txt = (
    <span className="ci-status ci-progressing">
      <LoadingOutlined />
      {' '}
      {text || intl.formatMessage({ id: 'pages.cluster.status.progressing' })}
    </span>
  );
  return (
    <div>
      {
      link ? <Link to={link} className="ci-status ci-progressing">{txt}</Link> : txt
    }
    </div>
  );
};

const Suspended = (props: Pick<StatusProps, 'text'>) => {
  const { text } = props;

  const intl = useIntl();

  const txt = (
    <span className="ci-status ci-suspended">
      <HourglassOutlined />
      {' '}
      {text || intl.formatMessage({ id: 'pages.cluster.status.suspended' })}
    </span>
  );
  return (
    <div>
      {txt}
    </div>
  );
};

const NotFound = (props: Pick<StatusProps, 'text'>) => {
  const { text } = props;

  const intl = useIntl();

  const txt = (
    <span className="ci-status ci-notfound">
      <QuestionOutlined />
      {' '}
      {text || intl.formatMessage({ id: 'pages.cluster.status.notFound' })}
    </span>
  );
  return (
    <div>
      {txt}
    </div>
  );
};

const Freeing = (props: Pick<StatusProps, 'text'>) => {
  const { text } = props;

  const intl = useIntl();

  const txt = (
    <span className="ci-status ci-freeing">
      <RetweetOutlined />
      {' '}
      {text || intl.formatMessage({ id: 'pages.cluster.status.freeing' })}
    </span>
  );
  return (
    <div>
      {txt}
    </div>
  );
};

const Creating = (props: Pick<StatusProps, 'text'>) => {
  const { text } = props;

  const intl = useIntl();

  const txt = (
    <span className="ci-status ci-creating">
      <LoadingOutlined />
      {' '}
      {text || intl.formatMessage({ id: 'pages.cluster.status.creating' })}
    </span>
  );
  return (
    <div>
      {txt}
    </div>
  );
};

const Freed = (props: Pick<StatusProps, 'text'>) => {
  const { text } = props;

  const intl = useIntl();

  const txt = (
    <span className="ci-status ci-freed">
      <DisconnectOutlined />
      {' '}
      {text || intl.formatMessage({ id: 'pages.cluster.status.freed' })}
    </span>
  );
  return (
    <div>
      {txt}
    </div>
  );
};

const Deleting = (props: Pick<StatusProps, 'text'>) => {
  const { text } = props;

  const intl = useIntl();

  const txt = (
    <span className="ci-status ci-deleting">
      <DeleteOutlined />
      {' '}
      {text || intl.formatMessage({ id: 'pages.cluster.status.deleting' })}
    </span>
  );
  return (
    <div>
      {txt}
    </div>
  );
};

// state for pods
const PodRunning = (props: Pick<StatusProps, 'text'>) => {
  const { text } = props;
  return (
    <span className="badge-color-green badge-content">
      {text}
    </span>
  );
};

const PodPending = (props: Omit<StatusProps, 'link'>) => {
  const { text, message } = props;
  return (
    <Tooltip title={message}>
      <span className="badge-color-yellow badge-content">
        {text}
      </span>
    </Tooltip>
  );
};

const PodError = (props: Omit<StatusProps, 'link'>) => {
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
const Unknown = () => (
  <span className="badge-color-grey badge-content">
    Unknown
  </span>
);

// state for oline status
const Online = (props: Pick<StatusProps, 'text'>) => {
  const { text } = props;
  return (
    <span style={{ whiteSpace: 'nowrap' }} className="badge-color-blue badge-content">
      {text || 'Online'}
    </span>
  );
};

const Offline = (props: Pick<StatusProps, 'text'>) => {
  const { text } = props;
  return (
    <span className="badge-color-brown badge-content">
      {text || 'Offline'}
    </span>
  );
};

// StatusComponent returns the status component
const StatusComponent = (props: { clusterStatus: string, manualPaused: boolean }) => {
  const { clusterStatus, manualPaused } = props;
  const intl = useIntl();
  if (manualPaused) {
    return <Suspended text={intl.formatMessage({ id: 'pages.cluster.status.manualPaused' })} />;
  }
  switch (clusterStatus) {
    case ClusterStatus.CREATING:
      return <Creating text={intl.formatMessage({ id: 'pages.cluster.status.creating' })} />;
    case ClusterStatus.PROGRESSING:
      return <Progressing text={intl.formatMessage({ id: 'pages.cluster.status.deploying' })} />;
    case ClusterStatus.HEALTHY:
      return <Succeeded text={intl.formatMessage({ id: 'pages.cluster.status.normal' })} />;
    case ClusterStatus.DEGRADED:
      return <Failed text={intl.formatMessage({ id: 'pages.cluster.status.abnormal' })} />;
    case ClusterStatus.SUSPENDED:
      return <Suspended text={intl.formatMessage({ id: 'pages.cluster.status.stepPaused' })} />;
    case ClusterStatus.FREEING:
      return <Freeing text={intl.formatMessage({ id: 'pages.cluster.status.freeing' })} />;
    case ClusterStatus.FREED:
      return <Freed text={intl.formatMessage({ id: 'pages.cluster.status.freed' })} />;
    case ClusterStatus.DELETING:
      return <Deleting text={intl.formatMessage({ id: 'pages.cluster.status.deleting' })} />;
    case ClusterStatus.NOTFOUND:
      return <NotFound text={intl.formatMessage({ id: 'pages.cluster.status.unreleased' })} />;
    default:
      return <NotFound text={intl.formatMessage({ id: 'pages.cluster.status.notFound' })} />;
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

const defaultValues: StatusProps = {
  text: '',
  link: '',
  message: '',
};

Succeeded.defaultProps = {
  ...defaultValues,
};

Failed.defaultProps = {
  ...defaultValues,
};

Progressing.defaultProps = {
  ...defaultValues,
};

Suspended.defaultProps = {
  ...defaultValues,
};

NotFound.defaultProps = {
  ...defaultValues,
};

PodRunning.defaultProps = {
  ...defaultValues,
};

Online.defaultProps = {
  ...defaultValues,
};

Offline.defaultProps = {
  ...defaultValues,
};

PodPending.defaultProps = {
  ...defaultValues,
};

Cancelled.defaultProps = {
  ...defaultValues,
};

Freeing.defaultProps = {
  ...defaultValues,
};

Creating.defaultProps = {
  ...defaultValues,
};

Freed.defaultProps = {
  ...defaultValues,
};

Deleting.defaultProps = {
  ...defaultValues,
};

PodError.defaultProps = {
  ...defaultValues,
};

export {
  Succeeded,
  Failed,
  Progressing,
  Suspended,
  NotFound,
  PodRunning,
  Unknown,
  Online,
  Offline,
  PodPending,
  Cancelled,
  Ready,
  Pending,
  Freeing,
  Freed,
  Deleting,
  StatusComponent,
  isRestrictedStatus,
  PodError,
};
