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
    data: API.GroupPageResult;
  }>('/api/v1/groups/search', {
    method: 'GET',
    params: {
      ...params
    }
  });
}

/** create a group POST /api/v1/groups */
export async function createGroup(body: API.NewGroup, options?: { [key: string]: any }) {
  return request('/api/v1/groups', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** get the detail of a group GET /api/v1/groups/${param0} */
export async function getGroupDetail(
  params: {
    id: string;
  },
  options?: { [key: string]: any },
) {
  const { id } = params;
  return request<API.Data>(`/api/v1/groups/${id}`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** update detail of a group PUT /api/v1/groups/${param0} */
export async function updateGroupDetail(
  params: {
    id: string;
  },
  body: API.Group,
  options?: { [key: string]: any },
) {
  const { id } = params;
  return request(`/api/v1/groups/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** delete an empty group DELETE /api/v1/groups/${param0} */
export async function deleteGroup(
  params: {
    id: string;
  },
  options?: { [key: string]: any },
) {
  const { id } = params;
  return request(`/api/v1/groups/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

