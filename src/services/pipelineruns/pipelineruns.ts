import { request } from 'umi';

export async function cancelPipeline(pipelinerunID: number) {
  return request(`/apis/core/v1/pipelineruns/${pipelinerunID}/next`, {
    method: 'POST',
  });
}

export async function queryPipelineLog(pipelinerunID: number) {
  return request(`/apis/core/v1/pipelineruns/${pipelinerunID}/log`, {
    method: 'GET',
    responseType: 'text',
  });
}
