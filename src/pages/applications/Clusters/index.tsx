import { useRequest } from '@@/plugin-request/request';
import { useModel } from '@@/plugin-model/useModel';
import ClusterV1 from './v1';
import ClusterV2 from './v2';

import { getApplicationV2 } from '@/services/applications/applications';
import { isVersion2 } from '@/services/version/version';

export default () => {
  const { initialState } = useModel('@@initialState');
  const { id: applicationID } = initialState!.resource;
  const { data } = useRequest(() => getApplicationV2(applicationID));
  return (
    isVersion2(data) ? <ClusterV2 /> : <ClusterV1 />
  );
};
