// @ts-ignore
/* eslint-disable */
import {request} from 'umi';

export async function queryChildren(groupID: number, pageNumber: number, pageSize: number) {
  return request<{
    data: API.PageResult<API.GroupChild>;
  }>(`/apis/front/v1/groups/${groupID}/children`, {
    method: 'GET',
    params: {
      pageNumber,
      pageSize
    }
  });
}

export async function querySubGroups(groupID: number, pageNumber: number, pageSize: number) {
  return request<{
    data: API.PageResult<API.GroupChild>;
  }>(`/apis/core/v1/groups/${groupID}/groups`, {
    method: 'GET',
    params: {
      pageNumber,
      pageSize
    }
  });
}

export async function searchGroups(params: API.PageParam) {
  return request<{
    data: API.PageResult<API.GroupChild>
  }>('/apis/front/v1/groups/searchgroups', {
    method: 'GET',
    params: {
      ...params,
      groupID: 0
    }
  });
}

export async function searchChildren(params: API.GroupFilterParam) {
  return request<{
    data: API.PageResult<API.GroupChild>;
  }>('/apis/front/v1/groups/searchchildren', {
    method: 'GET',
    params
  });
}

export async function createGroup(body: API.NewGroup, options?: { [key: string]: any }) {
  return request('/apis/core/v1/groups', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function createSubGroup(id: number, data: API.NewGroup) {
  return request(`/apis/core/v1/groups/${id}/groups`, {
    method: 'POST',
    data
  });
}

export async function getGroupByID(id: number) {
  return request<{
    data: API.Group
  }>(`/apis/core/v1/groups/${id}`, {
    method: 'GET',
  });
}

export async function updateGroupDetail(id: number,
  body: API.Group,
) {
  return request(`/apis/core/v1/groups/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

export async function deleteGroup(
  params: {
    id: number;
  },
  options?: { [key: string]: any },
) {
  const {id} = params;
  return request(`/apis/core/v1/groups/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

