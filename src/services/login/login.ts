import { request } from 'umi';

export async function login(params: { redirectUrl: string, fromHost: string }) {
  return request<{
    data: string;
  }>('/apis/login/v1/login', {
    method: 'POST',
    params: {
      ...params,
    },
  });
}

export async function outLogin() {
  return request('/apis/login/v1/logout', {
    method: 'POST',
  });
}

export async function currentUser() {
  return request<{
    data: API.CurrentUser
  }>('/apis/login/v1/status', {
    method: 'GET',
  });
}
