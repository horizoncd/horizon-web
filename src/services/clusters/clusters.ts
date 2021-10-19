import { request } from 'umi';

export async function queryClusters(application: string, params: API.ClusterFilter) {
  return request<{
    data: API.PageResult<API.ClusterBaseInfo>;
  }>(`/apis/core/v1/applications/${application}/clusters`, {
    method: 'GET',
    params
  });
}

export async function createCluster(application: string, scope: string, data: API.NewCluster) {
  return request(`/apis/core/v1/applications/${application}/clusters`, {
    method: 'POST',
    params: {
      scope
    },
    data
  });
}

export async function updateCluster(application: string, data: API.UpdateCluster) {
  return request(`/apis/core/v1/applications/${application}/clusters`, {
    method: 'PUT',
    data
  });
}

export async function buildDeploy(cluster: string, data: API.ClusterBuildDeploy) {
  return request<{
    data: {
      id: string
    };
  }>(`/apis/core/v1/clusters/${cluster}/builddeploy`, {
    method: 'POST',
    data
  });
}

export async function deploy(cluster: string, data: API.ClusterDeploy) {
  return request<{
    data: {
      id: string
    };
  }>(`/apis/core/v1/clusters/${cluster}/deploy`, {
    method: 'POST',
    data
  });
}

export async function rollback(cluster: string, data: API.ClusterRollback) {
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

export async function next(cluster: string) {
  return request(`/apis/core/v1/clusters/${cluster}/next`, {
    method: 'POST',
  });
}

export async function diffsOfCode(cluster: string, targetBranch: string) {
  return request<{
    data: API.ClusterDiffs
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

export async function getClusterStatus(cluster: string) {
  return request<{
    data: API.ClusterStatus
  }>(`/apis/core/v1/clusters/${cluster}/status`, {
    method: 'GET',
  });
}

