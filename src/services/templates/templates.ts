import { request } from 'umi';
import type { API } from '../typings';

export async function queryTemplates(fullpath: boolean) {
  return request<{
    data: Templates.Template[];
  }>('/apis/core/v1/templates', {
    method: 'GET',
    params: {
      fullpath,
    },
  });
}

export async function queryReleases(template: string | number) {
  const path = `/apis/core/v1/templates/${template}/releases`;
  const config = {
    method: 'GET',
  };
  type returnType = {
    data: Templates.Release[];
  };
  return request<returnType>(path, config);
}

export async function querySchema(template: string, release: string, params?: API.TemplateSchemaParam) {
  return request<{
    data: any;
  }>(`/apis/core/v1/templates/${template}/releases/${release}/schema`, {
    method: 'GET',
    params,
  });
}

export async function queryTemplate(template: string | number) {
  const path = `/apis/core/v1/templates/${template}`;
  const config = {
    method: 'GET',
  };
  type returnType = {
    data: Templates.Template
  };
  return request<returnType>(path, config);
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

export async function getReleases(template: string | number) {
  const path = `/apis/core/v1/templates/${template}/releases`;
  const config = {
    method: 'GET',
  };
  type returnType = {
    data: Templates.Release[],
  };
  return request<returnType>(path, config);
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

export async function getTemplates(group: number, fullpath: boolean = false) {
  const path = `/apis/core/v1/groups/${group}/templates`;
  const config = {
    method: 'GET',
    params: {
      fullpath,
    },
  };
  type returnType = {
    data: Templates.Template[]
  };
  return request<returnType>(path, config);
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
  type returnType = {
    data: Templates.Release
  };
  return request<returnType>(path, config);
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
