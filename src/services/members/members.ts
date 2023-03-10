import { request } from 'umi';
import { API } from '../typings';

export async function queryUsers(pageNumber: number, pageSize: number, filter?: string) {
  const params: any = { pageNumber, pageSize };
  if (filter) {
    params.filter = filter;
  }
  return request('/apis/core/v1/users', {
    method: 'GET',
    params,
  });
}

export async function queryGroupMembers(resourceID: number, filter?: string) {
  const params: any = {};
  if (filter) {
    params.filter = filter;
  }
  return request(`/apis/core/v1/groups/${resourceID}/members`, {
    method: 'GET',
    params,
  });
}

export async function inviteGroupMember(body: API.NewMember) {
  return request(`/apis/core/v1/groups/${body.resourceID}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

export async function queryApplicationMembers(resourceID: number, filter?: string) {
  const params: any = {};
  if (filter) {
    params.filter = filter;
  }
  return request(`/apis/core/v1/applications/${resourceID}/members`, {
    method: 'GET',
    params,
  });
}

export async function queryApplicationClusterMembers(resourceID: number, filter?: string) {
  const params: any = {};
  if (filter) {
    params.filter = filter;
  }
  return request(`/apis/core/v1/clusters/${resourceID}/members`, {
    method: 'GET',
    params,
  });
}

export async function inviteApplicationMember(body: API.NewMember) {
  return request(`/apis/core/v1/applications/${body.resourceID}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

export async function inviteApplicationClusterMember(body: API.NewMember) {
  return request(`/apis/core/v1/clusters/${body.resourceID}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

export async function removeMember(memberID: number, resourceType: string = 'group') {
  return request(`/apis/core/v1/members/${memberID}`, {
    method: 'DELETE',
    params: {
      resourceType,
    },
  });
}

export async function updateMember(memberID: number, body: API.UpdateMember) {
  return request(`/apis/core/v1/members/${memberID}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

export async function queryRoles() {
  return request<{
    data: API.Role[]
  }>('/apis/core/v1/roles', {
    method: 'GET',
  });
}

export async function querySelfMember(resourceType: string, resourceID: number) {
  return request(`/apis/core/v1/${resourceType}s/${resourceID}/members?`, {
    method: 'GET',
    params: {
      self: 'true',
    },
  });
}

export async function queryTemplateMembers(resourceID: string | number, filter?: string) {
  const params: any = {};
  if (filter) {
    params.filter = filter;
  }
  return request(`/apis/core/v1/templates/${resourceID}/members`, {
    method: 'GET',
    params,
  });
}

export async function inviteTemplateMember(body: API.NewMember) {
  return request(`/apis/core/v1/templates/${body.resourceID}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}
