import {request} from 'umi';

export async function queryDashboards(env: string) {
  return request<{
    data: API.SLODashboards;
  }>(`/apis/front/v1/slo/dashboards`, {
    method: 'GET',
    params: {
      env
    }
  });
}
