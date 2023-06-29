// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

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

export enum CatalogType {
    V1 = 'v1',
    Workload = 'workload',
    Middleware = 'middleware',
    Database = 'database',
    Other = 'other'
}
