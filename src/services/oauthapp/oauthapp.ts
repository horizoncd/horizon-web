import { request } from 'umi';

export async function create(id: number, data: API.NewOauthApp) {
  return request(`/apis/core/v1/groups/${id}/oauthapps`, {
    method: 'POST',
    data,
  });
}

export async function list(id: number) {
  return request<{
    data: API.APPBasicInfo[];
  }>(`/apis/core/v1/groups/${id}/oauthapps`, {
    method: 'GET',
  });
}

export async function get(clientID: string) {
  return request<{
    data: API.APPBasicInfo[];
  }>(`/apis/core/v1/oauthapps/${clientID}`, {
    method: 'GET',
  });
}

export async function update(clientID: string, data: API.APPBasicInfo) {
  return request(`/apis/core/v1/oauthapps/${clientID}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteOauthApp(clientID: string) {
  return request(`/apis/core/v1/oauthapps/${clientID}`, {
    method: 'DELETE',
  });
}

export async function createSecret(clientID: string) {
  return request<{
    data: API.OauthClientSecretInfo
  }>(
    `/apis/core/v1/oauthapps/${clientID}/clientsecret`,
    { method: 'POST' },
  );
}

export async function listSecret(clientID: string) {
  return request<{
    data: API.OauthClientSecretInfo[]
  }>(`/apis/core/v1/oauthapps/${clientID}/clientsecret`, { method: 'GET' });
}

export async function deleteSecret(clientID: string, clientSecretID: number) {
  return request(
    `/apis/core/v1/oauthapps/${clientID}/clientsecret/${clientSecretID}`,
    { method: 'DELETE' },
  );
}
