import {request} from 'umi';

export async function queryTerminalSessionID(applicationID: number, clusterID: number, params: CLUSTER.PodQuery) {
  return request<{
    data: {
      id: string
    }
  }>(`/api/v1/applications/${applicationID}/clusters/${clusterID}/sessionid`, {
    method: 'GET',
    params
  });
}

export async function queryPodStdout(applicationID: number, clusterID: number, params: CLUSTER.PodQuery) {
  return request(`/api/v1/applications/${applicationID}/clusters/${clusterID}/containerlog`, {
    method: 'GET',
    params
  });
}
