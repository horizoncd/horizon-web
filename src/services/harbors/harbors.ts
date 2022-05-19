import {request} from "@@/plugin-request/request";

export async function queryHarbors() {
  return request<{
    data: SYSTEM.Harbor[];
  }>(`/apis/core/v1/harbors`, {
    method: 'GET',
  });
}

export async function updateHarborByID(id: number, harbor: SYSTEM.Harbor) {
  return request(`/apis/core/v1/harbors/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: harbor
  });
}

export async function deleteHarborByID(id: number) {
  return request(`/apis/core/v1/harbors/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    }
  });
}

export async function createHarbor(harbor: SYSTEM.Harbor) {
  return request(`/apis/core/v1/harbors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: harbor
  });
}
