import { useModel } from '@@/plugin-model/useModel';
import { useRequest } from '@@/plugin-request/request';
import { getClusterV2 } from '@/services/clusters/clusters';
import { isVersion2 } from '@/services/version/version';
import PodsV1 from './v1';
import PodsV2 from './v2';
import { CenterSpin } from '@/components/Widget';

export default () => {
  const { initialState } = useModel('@@initialState');
  const { id } = initialState!.resource;
  const { data: clusterDataV2 } = useRequest(() => getClusterV2(id));
  if (clusterDataV2) {
    return (
      isVersion2(clusterDataV2) ? <PodsV2 /> : <PodsV1 />
    );
  }
  return <CenterSpin />;
};
