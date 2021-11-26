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

export async function online(clusterID: number, pods: string[]) {
  return request(`/apis/core/v1/clusters/${clusterID}/online`, {
    method: 'POST',
    data: {
      podList: pods
    }
  });
}

export async function offline(clusterID: number, pods: string[]) {
  return request(`/apis/core/v1/clusters/${clusterID}/offline`, {
    method: 'POST',
    data: {
      podList: pods
    }
  });
}

export async function queryPodEvents(clusterID: number, podName: string) {
  return request(`/apis/core/v1/clusters/${clusterID}/events`, {
    method: 'GET',
    params: {
      podName
    }
  });
}
