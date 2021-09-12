// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

export async function queryResource(path: string) {
  return request<{
    data: API.Resource;
  }>('/api/v1/groups', {
    method: 'GET',
    params: {
      path
    },
  });
}
