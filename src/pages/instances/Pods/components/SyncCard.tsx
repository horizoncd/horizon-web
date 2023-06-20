import { Card } from 'antd';
import { RolloutDeployPanel } from '@/components/rollout';

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

  return (
    <Card>
      <RolloutDeployPanel step={step} refresh={refresh} clusterStatus={clusterStatus} />
    </Card>
  );
}

export default StepCard;
