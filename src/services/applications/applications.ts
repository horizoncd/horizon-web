import {request} from 'umi';

export async function createApplication(groupID: number, body: API.NewApplication) {
  return request<{
    data: API.Application
  }>(`/apis/core/v1/groups/${groupID}/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

export async function updateApplication(id: number, body: API.NewApplication) {
  return request(`/apis/core/v1/applications/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

export async function getApplication(id: number) {
  return request<{
    data: API.Application;
  }>(`/apis/core/v1/applications/${id}`, {
    method: 'GET',
  });
}

export async function deleteApplication(id: number) {
  return request<{
    data: API.Application;
  }>(`/apis/core/v1/applications/${id}`, {
    method: 'DELETE',
  });
}

export async function searchApplications(params: API.PageParam) {
  return request<{
    data: API.PageResult<API.Application>;
  }>('/apis/front/v1/applications/searchapplications', {
    method: 'GET',
    params
  });
}

export async function getApplicationEnvTemplate(applicationID: number, environment: string) {
  return request(`/apis/core/v1/applications/${applicationID}/envtemplates`, {
    method: 'GET',
    params: {
      environment
    }
  });
}

export async function updateApplicationEnvTemplate(applicationID: number, environment: string, data: any) {
  return request<{
    data: API.PageResult<API.Application>;
  }>(`/apis/core/v1/applications/${applicationID}/envtemplates`, {
    method: 'POST',
    params: {
      environment
    },
    data
  });
}
