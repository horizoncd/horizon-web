// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

export async function queryResourceType(path: string) {
  return request<{
    data: {
      resourceType: string,
      resourceId: number
    };
  }>('/api/v1/get-resource-type', {
    method: 'GET',
    params: {
      path
    }
  });
}
