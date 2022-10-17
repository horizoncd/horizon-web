import { request } from 'umi';
import type { API } from '../typings';

export enum StatusCode {
  StatusSucceed = 1,
  StatusUnknown,
  StatusFailed,
  StatusOutOfSync,
}

export async function queryTemplates(fullpath: boolean = false, selfOnly: boolean = false) {
  return request<{
    data: Templates.Template[];
  }>('/apis/core/v1/templates', {
    method: 'GET',
    params: {
      fullpath, selfOnly,
    },
  });
}

export async function queryReleases(template: string | number) {
  const path = `/apis/core/v1/templates/${template}/releases`;
  const config = {
    method: 'GET',
  };

  return request<{ data: Templates.Release[] }>(path, config);
}

export async function querySchema(template: string, release: string, params?: API.TemplateSchemaParam) {
  return request<{
    data: Templates.TemplateSchema;
  }>(`/apis/core/v1/templates/${template}/releases/${release}/schema`, {
    method: 'GET',
    params,
  });
}

export async function queryTemplate(template: string | number, withReleases: boolean = false) {
  const path = `/apis/core/v1/templates/${template}`;
  const config = {
    method: 'GET',
    params: {
      withReleases,
    },
  };
  return request<{ data: Templates.Template }>(path, config);
}

export async function getTemplatesByUser(fullpath: boolean = false) {
  return queryTemplates(fullpath, true);
}

export async function updateTemplate(template: string | number, data: Templates.UpdateTemplateRequest) {
  const path = `/apis/core/v1/templates/${template}`;
  const config = {
    method: 'PUT',
    Headers: {
      'Content-Type': 'application/json',
    },
    data,
  };
  return request(path, config);
}

export async function deleteTemplate(template: string | number) {
  const path = `/apis/core/v1/templates/${template}`;
  const config = {
    method: 'DELETE',
  };
  return request(path, config);
}

export async function createRelease(template: string | number, data: Templates.CreateReleaseRequest) {
  const path = `/apis/core/v1/templates/${template}/releases`;
  const config = {
    method: 'POST',
    Headers: {
      'Content-Type': 'application/json',
    },
    data,
  };
  return request(path, config);
}

export async function createTemplate(group: number, data: Templates.CreateTemplateRequest) {
  const path = `/apis/core/v1/groups/${group}/templates`;
  const config = {
    method: 'POST',
    Headers: {
      'Content-Type': 'application/json',
    },
    data,
  };
  return request(path, config);
}

export async function getTemplates(group: number, fullpath: boolean = false, recursive: boolean = false) {
  const path = `/apis/core/v1/groups/${group}/templates`;
  const config = {
    method: 'GET',
    params: {
      fullpath, recursive,
    },
  };
  return request<{ data: Templates.Template[] }>(path, config);
}

export async function getRootTemplates(fullpath: boolean = false, recursive: boolean = false) {
  return getTemplates(0, fullpath, recursive);
}

export async function getSchema(release: number) {
  const path = `/apis/core/v1/templatereleases/${release}/schema`;
  const config = {
    method: 'GET',
  };
  return request(path, config);
}

export async function getRelease(release: number) {
  const path = `/apis/core/v1/templatereleases/${release}`;
  const config = {
    method: 'GET',
  };
  return request<{ data: Templates.Release }>(path, config);
}

export async function updateRelease(release: number, data: Templates.UpdateReleaseRequest) {
  const path = `/apis/core/v1/templatereleases/${release}`;
  const config = {
    method: 'PUT',
    Headers: {
      'Content-Type': 'application/json',
    },
    data,
  };
  return request(path, config);
}

export async function deleteRelease(release: number) {
  const path = `/apis/core/v1/templatereleases/${release}`;
  const config = {
    method: 'DELETE',
  };
  return request(path, config);
}

export async function syncReleaseToRepo(release: number) {
  const path = `/apis/core/v1/templatereleases/${release}/sync`;
  const config = {
    method: 'POST',
  };
  return request(path, config);
}
