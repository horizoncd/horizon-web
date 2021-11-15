import {request} from 'umi';

export async function listBranch(params: API.CodeBranchSearchParam) {
  return request<{
    data: string[];
  }>(`/apis/front/v1/code/listbranch`, {
    method: 'GET',
    params,
  });
}
