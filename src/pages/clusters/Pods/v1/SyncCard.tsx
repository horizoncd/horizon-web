import { RolloutDeployPanel } from '../components';

interface SyncCardProps {
  clusterStatus: CLUSTER.ClusterStatusV2,
  refreshStatus: () => void,
}

const WorkloadRollout = 'argoproj.io/v1alpha1/Rollout';

function SyncCard(props: SyncCardProps) {
  const { clusterStatus, refreshStatus } = props;
  const { workload, step } = clusterStatus;

  if (!step) {
    return <div />;
  }

  if (workload === WorkloadRollout) {
    return <RolloutDeployPanel refreshStatus={refreshStatus} clusterStatus={clusterStatus} />;
  }
  return <div />;
}

export default SyncCard;
