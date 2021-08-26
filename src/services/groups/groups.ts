// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

export async function queryGroupChildren(parentId: number) {
  return request<{
    data: API.GroupChild[];
  }>('/api/v1/groups/children', {
    method: 'GET',
    params: {
      parentId
    }
  });
}

export async function queryGroups(params: API.GroupFilterParam) {
  return request<{
    data: API.GroupChild[];
  }>('/api/v1/groups/search', {
    method: 'GET',
    params: {
      ...params
    }
  });
}
