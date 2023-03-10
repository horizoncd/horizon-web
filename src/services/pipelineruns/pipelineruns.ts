import { request } from 'umi';

export async function cancelPipeline(pipelinerunID: number) {
  return request(`/apis/core/v1/pipelineruns/${pipelinerunID}/stop`, {
    method: 'POST',
  });
}

export async function queryPipelineLog(pipelinerunID: number) {
  return fetch(`/apis/core/v1/pipelineruns/${pipelinerunID}/log`)
    .then((resp) => resp.text());
}

export async function getPipeline(pipelinerunID: number) {
  return request<{
    data: PIPELINES.Pipeline
  }>(`/apis/core/v1/pipelineruns/${pipelinerunID}`, {
    method: 'GET',
  });
}

export async function getPipelineDiffs(pipelinerunID: number) {
  return request<{
    data: PIPELINES.Diffs
  }>(`/apis/core/v1/pipelineruns/${pipelinerunID}/diffs`, {
    method: 'GET',
  });
}
