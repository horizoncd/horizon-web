import { request } from 'umi';

export async function createApplication(groupID: number, body: API.NewApplication) {
  return request<{
    data: API.Application
  }>(`/apis/core/v1/groups/${groupID}/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

export async function createApplicationV2(groupID: number, body: API.CreateOrUpdateRequestV2) {
  return request<{
    data: API.CreateApplicationResponseV2
  }>(`/apis/core/v2/groups/${groupID}/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

export async function updateApplicationV2(id: number, body: API.CreateOrUpdateRequestV2) {
  return request<{
    data: API.CreateApplicationResponseV2
  }>(`/apis/core/v2/applications/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

export async function updateApplication(id: number, body: API.NewApplication) {
  return request(`/apis/core/v1/applications/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

export async function getApplication(id: number) {
  return request<{
    data: API.Application;
  }>(`/apis/core/v1/applications/${id}`, {
    method: 'GET',
  });
}

export async function getApplicationV2(id: number | string) {
  return request<{
    data: API.GetApplicationResponseV2
  }>(`/apis/core/v2/applications/${id}`, { method: 'GET' });
}

export async function deleteApplication(id: number) {
  return request<{
    data: API.Application;
  }>(`/apis/core/v1/applications/${id}`, {
    method: 'DELETE',
  });
}

export async function listApplications(params: { userID?: number } & API.PageParam) {
  return request<{
    data: API.PageResult<API.Application>;
  }>('/apis/core/v1/applications', {
    method: 'GET',
    params,
  });
}

export async function getApplicationEnvTemplate(applicationID: number, environment: string) {
  return request(`/apis/core/v1/applications/${applicationID}/envtemplates`, {
    method: 'GET',
    params: {
      environment,
    },
  });
}

export async function getApplicationTags(applicationID: number) {
  return request<{
    data: API.Tags
  }>(`/apis/core/v2/applications/${applicationID}/tags`, {
    method: 'GET',
  });
}

export async function updateApplicationTags(applicationID: number, data: API.Tags) {
  return request<{
    data: API.Tags
  }>(`/apis/core/v2/applications/${applicationID}/tags`, {
    method: 'POST',
    data,
  });
}

export async function getApplicationRegions(applicationID: number) {
  return request<{
    data: [{
      environment: string,
      region: string,
    }]
  }>(`/apis/core/v1/applications/${applicationID}/defaultregions`, {
    method: 'GET',
  });
}

export async function transferApplication(applicationID: number, groupID: number) {
  return request(`/apis/core/v1/applications/${applicationID}/transfer`, {
    method: 'PUT',
    params: {
      groupID,
    },
  });
}

export async function updateApplicationRegions(applicationID: number, regions: any) {
  return request(`/apis/core/v1/applications/${applicationID}/defaultregions`, {
    method: 'POST',
    data: regions,
  });
}

export async function updateApplicationEnvTemplateV2(applicationID: number, environment: string, data: API.AppSchemeConfigs) {
  return request(`/apis/core/v2/applications/${applicationID}/envtemplates`, {
    method: 'POST',
    params: {
      environment,
    },
    data,
  });
}

export async function updateApplicationEnvTemplate(applicationID: number, environment: string, data: API.AppSchemeConfigs) {
  return request(`/apis/core/v1/applications/${applicationID}/envtemplates`, {
    method: 'POST',
    params: {
      environment,
    },
    data,
  });
}

export async function queryRegions(applicationID: number, env: string) {
  return request<{
    data: CLUSTER.Region[];
  }>(`/apis/core/v1/applications/${applicationID}/selectableregions?env=${env}`, {
    method: 'GET',
  });
}

export async function getApplicationByRelease(template: string, release: string, page: API.PageParam) {
  return request<{ data: { total: number, items: API.PageResult<API.Application>[] } }>(
    '/apis/core/v1/applications',
    {
      method: 'GET',
      params: {
        template,
        release,
        pageSize: page.pageSize,
        pageNumber: page.pageNumber,
      },
    },
  );
}

export async function queryPipelineStats(application: number, cluster: string, pageNumber: number, pageSize: number) {
  return request<{
    data: {
      total: number,
      items: [API.PipelineStats],
    };
  }>(`/apis/core/v1/applications/${application}/pipelinestats`, {
    method: 'GET',
    params: {
      cluster,
      pageNumber,
      pageSize,
    },
  });
}
