// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

export async function login(params: { redirectUrl: string; fromHost: string }) {
  return request<{
    data: string;
  }>('/api/pms/login', {
    method: 'GET',
    params: {
      ...params,
    },
  });
}

export async function outLogin() {
  return request('/api/pms/logout', {
    method: 'GET',
  });
}

export async function currentUser() {
  return request('/api/pms/login/status', {
    method: 'GET',
  });
}
