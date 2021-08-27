// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

export async function queryResource(path: string) {
  return request<{
    data: {
      resourceType: string,
      resourceId: number
    };
  }>('/api/v1/resources', {
    method: 'GET',
    params: {
      path
    },
  });
}
