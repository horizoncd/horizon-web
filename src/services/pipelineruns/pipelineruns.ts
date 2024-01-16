import { request } from 'umi';

export async function stopPipelineRun(pipelinerunID: number) {
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

export async function cancelPipelineRun(pipelinerunID: number) {
  return request(`/apis/core/v2/pipelineruns/${pipelinerunID}/cancel`, {
    method: 'POST',
  });
}

export async function runPipelineRun(pipelinerunID: number) {
  return request(`/apis/core/v2/pipelineruns/${pipelinerunID}/run`, {
    method: 'POST',
  });
}

export async function forceReadyPipelineRun(pipelinerunID: number) {
  return request(`/apis/core/v2/pipelineruns/${pipelinerunID}/forceready`, {
    method: 'POST',
  });
}

export async function listCheckRuns(pipelinerunID: number) {
  return request<{
    data: PIPELINES.CheckRun[]
  }>(`/apis/core/v2/pipelineruns/${pipelinerunID}/checkruns`, {
    method: 'GET',
  });
}

export async function listPRMessage(pipelinerunID: number, pageParam?: API.PageParam) {
  return request<{
    data: API.PageResult<PIPELINES.PrMessage>
  }>(`/apis/core/v2/pipelineruns/${pipelinerunID}/messages`, {
    method: 'GET',
    params: pageParam,
  });
}
