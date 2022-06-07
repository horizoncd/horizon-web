import {request} from "@@/plugin-request/request";

export async function queryRegions() {
  return request<{
    data: SYSTEM.Region[];
  }>(`/apis/core/v1/regions`, {
    method: 'GET',
  });
}

export async function getRegionByName(name: string) {
  return request<{
    data: SYSTEM.Region
  }>(`/apis/core/v1/regions/${name}`, {
    method: 'GET',
  });
}

export async function getRegionByID(id: number) {
  return request<{
    data: SYSTEM.Region
  }>(`/apis/core/v1/regions/${id}`, {
    method: 'GET',
  });
}

export async function updateRegionByID(id: number, region: SYSTEM.Region) {
  return request(`/apis/core/v1/regions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: region
  });
}

export async function deleteRegionByID(id: number) {
  return request(`/apis/core/v1/regions/${id}`, {
    method: 'DELETE',
  });
}

export async function createRegion(region: SYSTEM.Region) {
  return request(`/apis/core/v1/regions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: region
  });
}

export async function getRegionTags(regionID: number) {
  return request<{
    data: API.Tags
  }>(`/apis/core/v1/regions/${regionID}/tags`, {
    method: 'GET',
  });
}

export async function updateRegionTags(regionID: number, data: API.Tags) {
  return request<{
    data: API.Tags
  }>(`/apis/core/v1/regions/${regionID}/tags`, {
    method: 'POST',
    data,
  });
}
