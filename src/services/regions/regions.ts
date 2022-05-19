import {request} from "@@/plugin-request/request";

export async function queryRegions() {
  return request<{
    data: SYSTEM.Region[];
  }>(`/apis/core/v1/regions`, {
    method: 'GET',
  });
}
