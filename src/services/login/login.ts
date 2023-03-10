import { request } from 'umi';
import { API } from '../typings';

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

export async function loginCallback(code: string, state: string, redirectUrl: string) {
  return request('/apis/core/v1/login/callback', {
    method: 'GET',
    params: {
      redirectUrl, code, state,
    },
  });
}

export async function getAuthEndpoints(redirectUrl: string = '') {
  return request<{
    data: API.AuthEndpoint[],
  }>('/apis/core/v1/idps/endpoints', {
    method: 'GET',
    params: {
      redirectUrl,
    },
  });
}

export async function outLogin() {
  return request('/apis/core/v1/logout', {
    method: 'POST',
  });
}

export async function currentUser() {
  return request<{
    data: API.CurrentUser
  }>('/apis/core/v1/users/self', {
    method: 'GET',
  });
}

export async function loginByPasswd(data: { email: string, password: string }) {
  return request('/apis/core/v1/users/login', {
    method: 'POST',
    data,
  });
}
