import { request } from 'umi';

export async function createApplication(body: API.NewApplication) {
  return request(`/apis/core/v1/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

export async function updateApplication(name: string, body: API.NewApplication) {
  return request(`/apis/core/v1/applications/${name}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

export async function getApplication(name: string) {
  return request<{
    data: API.Application
  }>(`/apis/core/v1/applications/${name}`, {
    method: 'GET',
  });
}
