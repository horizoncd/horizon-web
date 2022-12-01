import { request } from 'umi';

// eslint-disable-next-line import/prefer-default-export
export async function listSupportEvents() {
  return request<{
    data: Record<string, EVENT.ActionWithDesc[]>;
  }>('/apis/core/v1/supportevents', {
    method: 'GET',
  });
}
