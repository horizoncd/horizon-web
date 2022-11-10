import { request } from 'umi';
import { API } from '../typings';

export async function createPersonalAccessToken(data: ACCESSTOKEN.CreatePersonalAccessTokenReq) {
  return request<{
    data: ACCESSTOKEN.CreateResourceAccessTokenResp
  }>('/apis/core/v1/accesstokens', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

export async function createResourceAccessToken(data: ACCESSTOKEN.CreateResourceAccessTokenReq, resourceType: string, resourceID: number) {
  return request<{
    data: ACCESSTOKEN.CreateResourceAccessTokenResp
  }>(`/apis/core/v1/${resourceType}s/${resourceID}/accesstokens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

export async function listPersonalAccessTokens(params: API.PageParam) {
  return request<{
    data: API.PageResult<ACCESSTOKEN.PersonalAccessToken>;
  }>('/apis/core/v1/accesstokens', {
    method: 'GET',
    params,
  });
}

export async function listResourceAccessTokens(params: API.PageParam, resourceType: string, resourceID: number) {
  return request<{
    data: API.PageResult<ACCESSTOKEN.ResourceAccessToken>;
  }>(`/apis/core/v1/${resourceType}s/${resourceID}/accesstokens`, {
    method: 'GET',
    params,
  });
}

export async function revokePersonalAccessToken(id: number) {
  return request(`/apis/core/v1/personalaccesstokens/${id}`, {
    method: 'DELETE',
  });
}

export async function revokeResourceAccessToken(id: number) {
  return request(`/apis/core/v1/accesstokens/${id}`, {
    method: 'DELETE',
  });
}

export async function listScopes() {
  return request<{
    data: API.Role[];
  }>('/apis/core/v1/scopes', {
    method: 'GET',
  });
}
