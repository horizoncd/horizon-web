import { request } from 'umi';

// eslint-disable-next-line import/prefer-default-export
export async function listEventActions() {
  return request<{
    data: Record<string, string[]>;
  }>('/apis/front/v1/eventactions', {
    method: 'GET',
  });
}
