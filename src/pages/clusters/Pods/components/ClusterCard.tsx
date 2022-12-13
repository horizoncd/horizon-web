import { useIntl } from 'umi';
import DetailCard, { Param } from '@/components/DetailCard';
import { StatusComponent } from '@/components/State';

interface ClusterCardProps {
  cluster: CLUSTER.Cluster,
  clusterStatus: CLUSTER.ClusterStatusV2,
  manualPaused: boolean,
  podsInfo: {
    healthyPods: CLUSTER.PodInTable[],
    notHealthyPods: CLUSTER.PodInTable[],
  },
  region2DisplayName: Map<string, string>,
  env2DisplayName: Map<string, string>,
}

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
      <span
        style={
        {
          margin: '0 0 6px 5px',
          wordBreak: 'break-all',
        }
      }
      >
        {ttlText}

      </span>
    );
  }
  return (
    <span
      style={
      {
        color: 'var(--red-500, #dd2b0e)',
        margin: '0 0 6px 5px',
        wordBreak: 'break-all',
      }
    }
    >
      {intl.formatMessage({ id: 'pages.common.time.hour' }, { hour })}

    </span>
  );
};

function ClusterCard(props: ClusterCardProps) {
  const {
    cluster, clusterStatus, podsInfo, region2DisplayName, env2DisplayName, manualPaused,
  } = props;

  const intl = useIntl();
  const baseInfo: Param[][] = [
    [
      {
        key: intl.formatMessage({ id: 'pages.cluster.basic.status' }),
        value: <StatusComponent clusterStatus={clusterStatus.status} manualPaused={manualPaused} />,
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
  ];

  if (cluster.ttlInSeconds) {
    baseInfo[1].push({
      key: intl.formatMessage({ id: 'pages.cluster.basic.expireIn' }),
      value: <DurationDisplay seconds={cluster.ttlInSeconds} />,
      description: intl.formatMessage({ id: 'pages.message.cluster.ttl.hint' }),
    });
  }

  return (
    <DetailCard
      title={intl.formatMessage({ id: 'pages.common.basicInfo' })}
      data={baseInfo}
    />
  );
}

export default ClusterCard;
