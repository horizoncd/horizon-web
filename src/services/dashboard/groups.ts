// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

export async function queryGroups() {
  return request<{
    data: any;
  }>('/api/groups', {
    method: 'GET',
  });
}
