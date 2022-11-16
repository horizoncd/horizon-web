import { request } from 'umi';
import { API } from '../typings';

export async function listUsers(params: { filter: string, pageSize?: number, pageNumber?: number } = { filter: '' }) {
  return request<{
    data: API.PageResult<API.User>;
  }>('/apis/core/v1/users', {
    method: 'GET',
    params,
  });
}

export async function getSelf() {
  return request<{
    data: API.User;
  }>('/apis/core/v1/users/self', {
    method: 'GET',
  });
}

export async function getUserByID(id: number) {
  return request<{
    data: API.User;
  }>(`/apis/core/v1/users/${id}`, {
    method: 'GET',
  });
}

export async function updateUserByID(id: number, isAdmin?: boolean, isBanned?: boolean) {
  const params: Record<string, any> = {};
  if (isAdmin !== undefined) {
    params.isAdmin = isAdmin;
  }
  if (isBanned !== undefined) {
    params.isBanned = isBanned;
  }
  return request<{
    data: API.User;
  }>(`/apis/core/v1/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-type': 'application/json',
    },
    data: params,
  });
}

export async function listLinks(userID: number) {
  return request<{ data: API.Link[] }>(`/apis/core/v1/users/${userID}/links`, {
    method: 'GET',
  });
}

export async function deleteLinks(linkID: number) {
  return request(
    `/apis/core/v1/links/${linkID}`,
    {
      method: 'DELETE',
    },
  );
}
