import { API } from '../typings';
import type { CLUSTER } from '../clusters';

export const pipelineV1 = '0.0.1';
export const pipelineV2 = '0.0.2';

export const isVersion2 = (data: API.GetApplicationResponseV2
| CLUSTER.ClusterV2 | undefined) => {
  if (data && data!.manifest && data!.manifest.manifestVersion !== pipelineV1) {
    return true;
  }
  return false;
};
