import { useRequest } from '@@/plugin-request/request';
import { useModel } from '@@/plugin-model/useModel';
import ClusterV1 from './v1';
import ClusterV2 from './v2';

import { getApplicationV2 } from '@/services/applications/applications';
import { isVersion2 } from '@/services/version/version';
import { CenterSpin } from '@/components/Widget';
import { AppOrClusterType } from '@/const';

export default () => {
  const { initialState } = useModel('@@initialState');
  const { id: applicationID } = initialState!.resource;
  const { data } = useRequest(() => getApplicationV2(applicationID));
  if (data) {
    if (isVersion2(data)) {
      if (data.git?.url) {
        return <ClusterV2 appType={AppOrClusterType.GIT_IMPORT} />;
      }
      return <ClusterV2 appType={AppOrClusterType.IMAGE_DEPLOY} />;
    }
    return <ClusterV1 />;
  }
  return <CenterSpin />;
};
