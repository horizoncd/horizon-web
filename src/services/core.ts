// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

export async function queryResource(fullPath: string) {
  return request<{
    data: API.Resource;
  }>('/apis/front/v1/groups', {
    method: 'GET',
    params: {
      fullPath
    },
  });
}
