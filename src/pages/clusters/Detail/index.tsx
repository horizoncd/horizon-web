import { useModel } from '@@/plugin-model/useModel';
import { useRequest } from '@@/plugin-request/request';
import { getClusterV2 } from '@/services/clusters/clusters';
import { ResourceType } from '@/const';
import DetailV1 from './v1';
import DetailV2 from './v2';
import { isVersion2 } from '@/services/version/version';

export default () => {
  const { initialState } = useModel('@@initialState');

  const {
    id: clusterID, type,
  } = initialState!.resource;

  const { data: result } = useRequest(() => getClusterV2(clusterID), {
    ready: type === ResourceType.CLUSTER && !!clusterID,
    refreshDeps: [clusterID],
  });

  return (
    isVersion2(result) ? <DetailV2 /> : <DetailV1 />
  );
};
