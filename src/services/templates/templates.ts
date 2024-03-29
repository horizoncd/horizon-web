import { request } from 'umi';

export enum StatusCode {
  StatusSucceed = 1,
  StatusUnknown,
  StatusFailed,
  StatusOutOfSync,
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
  const path = `/apis/core/v2/groups/${group}/templates`;
  const config = {
    method: 'POST',
    Headers: {
      'Content-Type': 'application/json',
    },
    data,
  };
  return request(path, config);
}

export async function listTemplatesV2(
  params: {
    fullpath: boolean,
    groupIDRecursive?: number,
    groupID?: number,
    filter?: string,
    withoutCI?: boolean,
    type?: string | string[],
    userID?: number
  },
) {
  const path = '/apis/core/v2/templates';
  const config = {
    method: 'GET',
    params,
  };
  return request<{ data: Templates.Template[] }>(path, config);
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
