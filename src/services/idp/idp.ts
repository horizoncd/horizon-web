import { request } from 'umi';
import { API } from '../typings';

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

export async function listIDPs() {
  return request<{ data: API.IDP[] }>(
    '/apis/core/v1/idps',
    {
      method: 'GET',
    },
  );
}
