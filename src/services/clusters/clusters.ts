import { request } from 'umi';

export async function queryClusters(applicationID: number, params: CLUSTER.ClusterFilter) {
  return request<{
    data: API.PageResult<CLUSTER.ClusterBase>;
  }>(`/apis/core/v1/applications/${applicationID}/clusters`, {
    method: 'GET',
    params
  });
}

export async function createCluster(applicationID: number, scope: string, data: CLUSTER.NewCluster) {
  return request<{
    data: CLUSTER.Cluster
  }>(`/apis/core/v1/applications/${applicationID}/clusters`, {
    method: 'POST',
    params: {
      scope
    },
    data
  });
}

export async function deleteCluster(clusterID: number) {
  return request(`/apis/core/v1/clusters/${clusterID}`, {
    method: 'DELETE',
  });
}

export async function getCluster(clusterID: number) {
  return request<{
    data: CLUSTER.Cluster
  }>(`/apis/core/v1/clusters/${clusterID}`, {
    method: 'GET',
  });
}

export async function updateCluster(clusterID: number, data: CLUSTER.UpdateCluster) {
  return request(`/apis/core/v1/clusters/${clusterID}`, {
    method: 'PUT',
    data
  });
}

export async function buildDeploy(clusterID: number, data: CLUSTER.ClusterBuildDeploy) {
  return request<{
    data: {
      id: string
    };
  }>(`/apis/core/v1/clusters/${clusterID}/builddeploy`, {
    method: 'POST',
    data
  });
}

export async function deploy(clusterID: number, data: CLUSTER.ClusterDeploy) {
  return request<{
    data: {
      id: string
    };
  }>(`/apis/core/v1/clusters/${clusterID}/deploy`, {
    method: 'POST',
    data
  });
}

export async function rollback(clusterID: number, data: CLUSTER.ClusterRollback) {
  return request<{
    data: {
      id: string
    };
  }>(`/apis/core/v1/clusters/${clusterID}/rollback`, {
    method: 'POST',
    data
  });
}

export async function restart(clusterID: number) {
  return request<{
    data: {
      id: string
    };
  }>(`/apis/core/v1/clusters/${clusterID}/restart`, {
    method: 'POST',
  });
}

export async function next(clusterID: number) {
  return request(`/apis/core/v1/clusters/${clusterID}/next`, {
    method: 'POST',
  });
}

export async function diffsOfCode(clusterID: number, targetBranch: string) {
  return request<{
    data: CLUSTER.ClusterDiffs
  }>(`/apis/core/v1/clusters/${clusterID}/diffs`, {
    method: 'GET',
    params: {
      targetBranch
    }
  });
}

export async function getPipelines(clusterID: number, params: PIPELINES.ListPipelineParam) {
  return request<{
    data: API.PageResult<PIPELINES.Pipeline>
  }>(`/apis/core/v1/clusters/${clusterID}/pipelineruns`, {
    method: 'GET',
    params
  });
}

export async function getClusterStatus(clusterID: number) {
  return request<{
    data: CLUSTER.ClusterStatus
  }>(`/apis/core/v1/clusters/${clusterID}/status`, {
    method: 'GET',
  });
}

export async function searchClusters(params: API.PageParam) {
  return request<{
    data: API.PageResult<CLUSTER.Cluster>;
  }>('/apis/front/v1/clusters/searchclusters', {
    method: 'GET',
    params
  });
}


