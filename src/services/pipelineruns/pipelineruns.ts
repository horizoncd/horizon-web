import { request } from 'umi';

export async function cancelPipeline(pipelinerunID: number) {
  return request(`/apis/core/v1/pipielineruns/${pipelinerunID}/next`, {
    method: 'POST',
  });
}
