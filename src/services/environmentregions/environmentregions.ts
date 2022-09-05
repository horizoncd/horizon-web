import { request } from '@@/plugin-request/request';

export async function queryEnvironmentRegions(environment: string) {
  return request<{
    data: SYSTEM.EnvironmentRegion[];
  }>(`/apis/core/v1/environmentregions?environmentName=${environment}`, {
    method: 'GET',
  });
}

export async function createEnvironmentRegion(environmentRegion: SYSTEM.EnvironmentRegion) {
  return request('/apis/core/v1/environmentregions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: environmentRegion,
  });
}

export async function deleteEnvironmentRegionByID(id: number) {
  return request(`/apis/core/v1/environmentregions/${id}`, {
    method: 'DELETE',
  });
}

export async function setDefault(id: number) {
  return request(`/apis/core/v1/environmentregions/${id}/setdefault`, {
    method: 'POST',
  });
}
