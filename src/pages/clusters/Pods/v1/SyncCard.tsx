import { RolloutDeployPanel } from '../components';

interface StepCardProps {
  // eslint-disable-next-line react/require-default-props
  step?: CLUSTER.Step,
  refresh: () => void
  clusterStatus: CLUSTER.ClusterStatusV2,
}

function StepCard(props: StepCardProps) {
  const { step, refresh, clusterStatus } = props;

  if (!step || step.total === 0) {
    return <div />;
  }

  return <RolloutDeployPanel step={step} refresh={refresh} clusterStatus={clusterStatus} />;
}

export default StepCard;
