import { request } from 'umi';
import { API } from '../typings';

export async function listIDPs() {
    type ReturnType = {
      data: API.IDP[],
    };

    const api = '/apis/core/v1/idps';

    return request<ReturnType>(api, {
      method: 'GET',
    });
}

export async function getIDPByID(id: number) {
    type ReturnType = {
      data: API.IDP,
    };

    const api = `/apis/core/v1/idps/${id}`;

    return request<ReturnType>(api, {
      method: 'GET',
    });
}

export async function createIDP(param: API.CreateIDPParam) {
  const api = '/apis/core/v1/idps';

  return request(api, {
    method: 'POST',
    data: param,
  });
}

export async function updateIDP(id: number, param: API.UpdateIDPParam) {
  const api = `/apis/core/v1/idps/${id}`;

  return request(api, {
    method: 'PUT',
    data: param,
  });
}

export async function deleteIDP(id: number) {
  const api = `/apis/core/v1/idps/${id}`;

  return request(api, {
    method: 'DELETE',
  });
}

export async function fetchDiscovery(fromUrl: string) {
  const api = '/apis/core/v1/idps/discovery';
  return request(api, {
    method: 'POST',
    data: {
      fromUrl,
    },
  });
}
