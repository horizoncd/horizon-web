import {request} from 'umi';

export async function queryEnvironments() {
  return request<{
    data: CLUSTER.Environment[];
  }>(`/apis/core/v1/environments`, {
    method: 'GET',
  });
}

export async function queryRegions(environment: string) {
  return request<{
    data: CLUSTER.Region[];
  }>(`/apis/core/v1/environments/${environment}/regions`, {
    method: 'GET',
  });
}
