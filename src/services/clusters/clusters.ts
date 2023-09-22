import { request } from 'umi';
import { GitRefType } from '@/services/code/code';

export async function queryClusters(applicationID: number, params: CLUSTER.ClusterFilter) {
  const filter = params;
  if (!filter.environment) {
    delete filter.environment;
  }

  return request<{
    data: API.PageResult<CLUSTER.ClusterBase>;
  }>(`/apis/core/v2/applications/${applicationID}/clusters`, {
    method: 'GET',
    params: filter,
  });
}

export async function createCluster(applicationID: number, scope: string, data: CLUSTER.NewCluster) {
  return request<{
    data: CLUSTER.Cluster
  }>(`/apis/core/v1/applications/${applicationID}/clusters`, {
    method: 'POST',
    params: {
      scope,
    },
    data,
  });
}

export async function createClusterV2(applicationID: number, scope: string, data: CLUSTER.NewInstanceV2) {
  return request<{
    data: CLUSTER.Cluster
  }>(`/apis/core/v2/applications/${applicationID}/clusters`, {
    method: 'POST',
    params: {
      scope,
    },
    data,
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
    // eslint-disable-next-line no-param-reassign
  }).then((c) => { if (c) c.data.version = 1; return c; });
}

export async function getClusterV2(clusterID: number) {
  return request<{
    data: CLUSTER.ClusterV2
  }>(`/apis/core/v2/clusters/${clusterID}`, {
    method: 'GET',
    // eslint-disable-next-line no-param-reassign
  }).then((c) => { if (c) c.data.version = 2; return c; });
}

export async function getClusterOutputs(clusterID: number) {
  return request<{
    data: CLUSTER.ClusterOutputs
  }>(`/apis/core/v1/clusters/${clusterID}/outputs`, {
    method: 'GET',
  });
}

export async function updateCluster(clusterID: number, data: CLUSTER.UpdateCluster) {
  return request(`/apis/core/v1/clusters/${clusterID}`, {
    method: 'PUT',
    data,
  });
}

export async function updateClusterV2(clusterID: number, data: CLUSTER.UpdateClusterV2) {
  return request(`/apis/core/v2/clusters/${clusterID}`, {
    method: 'PUT',
    data,
  });
}

export async function createPipelineRun(clusterID: number, data: CLUSTER.PipelineRunCreate) {
  return request<{
    data: PIPELINES.Pipeline
  }>(`/apis/core/v2/clusters/${clusterID}/pipelineruns`, {
    method: 'POST',
    data,
  });
}

export async function buildDeploy(clusterID: number, data: CLUSTER.ClusterBuildDeploy) {
  return request<{
    data: {
      id: string
    };
  }>(`/apis/core/v1/clusters/${clusterID}/builddeploy`, {
    method: 'POST',
    data,
  });
}

export async function deploy(clusterID: number, data: CLUSTER.ClusterDeploy) {
  return request<{
    data: {
      id: string
    };
  }>(`/apis/core/v1/clusters/${clusterID}/deploy`, {
    method: 'POST',
    data,
  });
}

export async function rollback(clusterID: number, data: CLUSTER.ClusterRollback) {
  return request<{
    data: {
      id: string
    };
  }>(`/apis/core/v1/clusters/${clusterID}/rollback`, {
    method: 'POST',
    data,
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

export async function freeCluster(clusterID: number) {
  return request<{
    data: {
      id: string
    };
  }>(`/apis/core/v1/clusters/${clusterID}/free`, {
    method: 'POST',
  });
}

export async function action(clusterID: number, data: {
  action: string,
  group: string,
  version: string,
  resource: string,
}) {
  return request(`/apis/core/v2/clusters/${clusterID}/action`, {
    method: 'POST',
    data,
  });
}

const rolloutGVR = {
  group: 'argoproj.io',
  version: 'v1alpha1',
  resource: 'rollouts',
};

export async function next(clusterID: number) {
  await action(clusterID, {
    action: 'promote',
    ...rolloutGVR,
  });
}

export async function pause(clusterID: number) {
  await action(clusterID, {
    action: 'pause',
    ...rolloutGVR,
  });
}

export async function resume(clusterID: number) {
  await action(clusterID, {
    action: 'resume',
    ...rolloutGVR,
  });
}

export async function autoPromote(clusterID: number) {
  await action(clusterID, {
    action: 'auto-promote',
    ...rolloutGVR,
  });
}

export async function promoteFull(clusterID: number) {
  await action(clusterID, {
    action: 'promote-full',
    ...rolloutGVR,
  });
}

export async function cancelAutoPromote(clusterID: number) {
  await action(clusterID, {
    action: 'cancel-auto-promote',
    ...rolloutGVR,
  });
}

export async function diffsOfCode(clusterID: number, refType: string, targetRef: string) {
  const params: Record<string, string> = {};
  if (refType === GitRefType.Tag) {
    params.targetTag = targetRef;
  } else if (refType === GitRefType.Branch) {
    params.targetBranch = targetRef;
  } else if (refType === GitRefType.Commit) {
    params.targetCommit = targetRef;
  }
  return request<{
    data: CLUSTER.ClusterDiffs
  }>(`/apis/core/v1/clusters/${clusterID}/diffs`, {
    method: 'GET',
    params,
  });
}

export async function listPipelineRuns(clusterID: number, params: PIPELINES.ListPipelineParam) {
  return request<{
    data: API.PageResult<PIPELINES.Pipeline>
  }>(`/apis/core/v2/clusters/${clusterID}/pipelineruns`, {
    method: 'GET',
    params,
  });
}

export async function getClusterResourceTree(clusterID: number) {
  return request<{
    data: CLUSTER.ResourceTree
  }>(`/apis/core/v2/clusters/${clusterID}/resourcetree`, {
    method: 'GET',
  });
}

export async function getStepV2(clusterID: number) {
  return request<{
    data: CLUSTER.Step
  }>(`/apis/core/v2/clusters/${clusterID}/step`, {
    method: 'GET',
  });
}

export async function getClusterStatusV2(clusterID: number) {
  return request<{
    data: CLUSTER.ClusterStatusV2
  }>(`/apis/core/v2/clusters/${clusterID}/status`, {
    method: 'GET',
  });
}

export async function getClusterBuildStatusV2(clusterID: number) {
  return request<{
    data: CLUSTER.ClusterBuildStatusV2,
  }>(`/apis/core/v2/clusters/${clusterID}/buildstatus`, {
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

export async function listClusters(params: API.PageParam & { userID?: number, region?: string, isFavorite?: boolean, withFavorite?: boolean }) {
  return request<{
    data: API.PageResult<CLUSTER.Cluster>;
  }>('/apis/core/v2/clusters', {
    method: 'GET',
    params,
  });
}

export async function getGrafanaDashboards(clusterID: number) {
  return request<{
    data: CLUSTER.GetGrafanaDashboards
  }>(`/apis/core/v1/clusters/${clusterID}/dashboards`, {
    method: 'GET',
  });
}

export async function getClusterTags(clusterID: number) {
  return request<{
    data: API.Tags
  }>(`/apis/core/v1/clusters/${clusterID}/tags`, {
    method: 'GET',
  });
}

export async function updateClusterTags(clusterID: number, data: API.Tags) {
  return request<{
    data: API.Tags
  }>(`/apis/core/v1/clusters/${clusterID}/tags`, {
    method: 'POST',
    data,
  });
}

export async function getClusterTemplateSchemaTags(clusterID: number) {
  return request<{
    data: API.Tags
  }>(`/apis/core/v1/clusters/${clusterID}/templateschematags`, {
    method: 'GET',
  });
}

export async function updateClusterTemplateSchemaTags(clusterID: number, data: API.Tags) {
  return request<{
    data: API.Tags
  }>(`/apis/core/v1/clusters/${clusterID}/templateschematags`, {
    method: 'POST',
    data,
  });
}

export async function addFavorite(clusterID: number) {
  return request(`/apis/core/v2/clusters/${clusterID}/favorite`, {
    method: 'POST',
  });
}

export async function deleteFavorite(clusterID: number) {
  return request(`/apis/core/v2/clusters/${clusterID}/favorite`, {
    method: 'DELETE',
  });
}
