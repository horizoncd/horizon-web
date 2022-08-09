// @ts-ignore
/* eslint-disable */
import { request } from 'umi';
import type { API } from './typings';

export async function queryResource(fullPath: string, type: string) {
  return request<{
    data: API.Resource;
  }>('/apis/front/v1/groups', {
    method: 'GET',
    params: {
      fullPath,
      type
    },
  });
}
