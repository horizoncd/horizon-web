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

export async function queryPodStdout(applicationID: number, clusterID: number, params: CLUSTER.PodQuery) {
  return request(`/api/v1/applications/${applicationID}/clusters/${clusterID}/containerlog`, {
    method: 'GET',
    params
  });
}
