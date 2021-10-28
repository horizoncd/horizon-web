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

export async function buildDeploy(cluster: string, data: CLUSTER.ClusterBuildDeploy) {
  return request<{
    data: {
      id: string
    };
  }>(`/apis/core/v1/clusters/${cluster}/builddeploy`, {
    method: 'POST',
    data
  });
}

export async function deploy(cluster: string, data: CLUSTER.ClusterDeploy) {
  return request<{
    data: {
      id: string
    };
  }>(`/apis/core/v1/clusters/${cluster}/deploy`, {
    method: 'POST',
    data
  });
}

export async function rollback(cluster: string, data: CLUSTER.ClusterRollback) {
  return request<{
    data: {
      id: string
    };
  }>(`/apis/core/v1/clusters/${cluster}/rollback`, {
    method: 'POST',
    data
  });
}

export async function restart(cluster: string) {
  return request<{
    data: {
      id: string
    };
  }>(`/apis/core/v1/clusters/${cluster}/restart`, {
    method: 'POST',
  });
}

export async function next(clusterID: number) {
  return request(`/apis/core/v1/clusters/${clusterID}/next`, {
    method: 'POST',
  });
}

export async function diffsOfCode(cluster: string, targetBranch: string) {
  return request<{
    data: CLUSTER.ClusterDiffs
  }>(`/apis/core/v1/clusters/${cluster}/diffs`, {
    method: 'GET',
    params: {
      targetBranch
    }
  });
}

export async function getPipelineRuns(cluster: string) {
  return request<{
    data: API.PageResult<API.Pipelinerun>
  }>(`/apis/core/v1/clusters/${cluster}/pipelineruns`, {
    method: 'GET',
  });
}

export async function getClusterStatus(clusterID: number) {
  return request<{
    data: CLUSTER.ClusterStatus
  }>(`/apis/core/v1/clusters/${clusterID}/status`, {
    method: 'GET',
  });
}

