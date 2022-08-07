import {request} from 'umi';
import type {V1Pod} from '@kubernetes/client-node'

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

export async function queryPodContainers(clusterID: number, params: CLUSTER.PodContainersQuery) {
  return request<{
    data: CLUSTER.ContainerDetail[]
  }>(`/apis/core/v1/clusters/${clusterID}/containers`, {
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

export async function deletePods(clusterID: number, pods: string[]) {
  return request(`/apis/core/v1/clusters/${clusterID}/pods`, {
    method: 'DELETE',
    params: {
      podName: pods
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

export async function queryPodDetail(clusterID: number, podName: string) {
  return request<{
    data: V1Pod
  }>(`/apis/core/v1/clusters/${clusterID}/pod`, {
    method: 'GET',
    params: {
      podName
    }
  });
}
