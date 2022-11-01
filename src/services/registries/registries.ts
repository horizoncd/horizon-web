import { request } from '@@/plugin-request/request';

export async function queryRegistries() {
  return request<{
    data: SYSTEM.Registry[];
  }>('/apis/core/v1/registries', {
    method: 'GET',
  });
}

export async function getRegistryByID(id: number) {
  return request<{
    data: SYSTEM.Registry;
  }>(`/apis/core/v1/registries/${id}`, {
    method: 'GET',
  });
}

export async function updateRegistryByID(id: number, registry: SYSTEM.Registry) {
  return request(`/apis/core/v1/registries/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: registry,
  });
}

export async function deleteRegistryByID(id: number) {
  return request(`/apis/core/v1/registries/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function createRegistry(registry: SYSTEM.Registry) {
  return request('/apis/core/v1/registries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: registry,
  });
}

export async function getKinds() {
  return request<{
    data: string[];
  }>('/apis/core/v1/registries/kinds', {
    method: 'GET',
  });
}
