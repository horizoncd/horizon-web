import {request} from "@@/plugin-request/request";

export async function queryEnvironmentRegions() {
  return request<{
    data: SYSTEM.EnvironmentRegion[];
  }>(`/apis/core/v1/environmentregions`, {
    method: 'GET',
  });
}
