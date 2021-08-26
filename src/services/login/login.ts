// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

export async function login(params: { redirectUrl: string, fromHost: string }) {
  return request<{
    data: string;
  }>('/api/v1/login', {
    method: 'POST',
    params: {
      ...params,
    },
  });
}

export async function outLogin() {
  return request('/api/v1/logout', {
    method: 'POST',
  });
}

export async function currentUser() {
  return request('/api/v1/login/status', {
    method: 'GET',
  });
}
