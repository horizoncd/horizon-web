import { useRequest } from '@@/plugin-request/request';
import { useModel } from '@@/plugin-model/useModel';
import ClusterV1 from './v1';
import ClusterV2 from './v2';

import { getApplicationV2 } from '@/services/applications/applications';
import { isVersion2 } from '@/services/version/version';
import { CenterSpin } from '@/components/Widget';

export default () => {
  const { initialState } = useModel('@@initialState');
  const { id: applicationID } = initialState!.resource;
  const { data } = useRequest(() => getApplicationV2(applicationID));
  if (data) {
    return (isVersion2(data) ? <ClusterV2 /> : <ClusterV1 />);
  }
  return <CenterSpin />;
};
