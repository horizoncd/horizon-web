import {request} from 'umi';

export async function queryTerminalSessionID(clusterID: number, params: CLUSTER.SessionQuery) {
  return request<{
    data: {
      id: string
    }
  }>(`/apis/core/v1/clusters/${clusterID}/terminal`, {
    method: 'POST',
    params
  });
}

export async function queryPodStdout(clusterID: number, params: CLUSTER.PodQuery) {
  return request(`/apis/core/v1/clusters/${clusterID}/containerlog`, {
    method: 'GET',
    params
  });
}
