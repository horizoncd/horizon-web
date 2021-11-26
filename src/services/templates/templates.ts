import {request} from 'umi';

export async function queryTemplates() {
  return request<{
    data: API.Template[];
  }>(`/apis/core/v1/templates`, {
    method: 'GET',
  });
}

export async function queryReleases(template: string) {
  return request<{
    data: API.Release[];
  }>(`/apis/core/v1/templates/${template}/releases`, {
    method: 'GET',
  });
}

export async function querySchema(template: string, release: string, params?: API.TemplateSchemaParam) {
  return request<{
    data: any;
  }>(`/apis/core/v1/templates/${template}/releases/${release}/schema`, {
    method: 'GET',
    params
  });
}
