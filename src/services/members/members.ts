import {request} from 'umi';


export async function queryUsers(pageNumber: number, pageSize: number, filter?: string) {
  const params: any = {pageNumber: pageNumber, pageSize: pageSize}
  if (filter != undefined) {
    params.filter = filter
  }
  return request(`/apis/front/v1/users/search`, {
    method: 'GET',
    params: params,
  });
}

export async function queryRoles() {
  return request('/apis/core/v1/roles', {
    method: 'GET'
  });
}

// export async function queryResourceMembers(resourceType: string, resourceID: number, pageNumber: number, pageSize: number, filter?: string) {
//   const params: any = {pageNumber: pageNumber, pageSize: pageSize}
//   if (filter != undefined) {
//     params.filter = filter
//   }
//   return request(`/apis/core/v1/resources/${resourceID}/members`, {
//     method: 'GET',
//     params: params,
//   });
// }

export async function queryGroupMembers(resourceType: string, resourceID: number, filter?: string) {
  const params: any = {}
  if (filter != undefined) {
    params.filter = filter
  }
  return request(`/apis/core/v1/groups/${resourceID}/members`, {
    method: 'GET',
    params: params,
  });
}

// export async function inviteGroupMember(groupID: number, body: API.NewMember) {
//   return request(`/apis/core/v1/resources/${groupID}/member`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     data: body,
//   });
// }

export async function inviteGroupMember(body: API.NewMember) {
  return request(`/apis/core/v1/groups/${body.resourceID}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

export async function removeMember(memberID: number) {
  return request(`/apis/core/v1/members/${memberID}`, {
    method: 'DELETE',
    params: {
      resourceType: "group"
    }
  });
}

export async function updateMember(memberID: number, body: API.UpdateMember) {
  return request(`/apis/core/v1/members/${memberID}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body
  });
}
