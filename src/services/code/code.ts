import { request } from 'umi';
import { API } from '../typings';

export enum GitRefType {
  Branch = 'branch',
  Tag = 'tag',
  Commit = 'commit',
}

export type GitInfo = {
  httpURL: string | URL | undefined;
  url: string
  subfolder: string
  branch: string
  tag: string
  commit: string
};

export const parseGitRef = (gitInfo: GitInfo) => {
  if (gitInfo.tag) {
    return {
      gitRefType: GitRefType.Tag,
      gitRef: gitInfo.tag,
    };
  } if (gitInfo.branch) {
    return {
      gitRefType: GitRefType.Branch,
      gitRef: gitInfo.branch,
    };
  } if (gitInfo.commit) {
    return {
      gitRefType: GitRefType.Commit,
      gitRef: gitInfo.commit,
    };
  }
  return {
    gitRefType: GitRefType.Branch,
    gitRef: '',
  };
};

export const gitRefTypeList = [
  {
    displayName: '分支',
    key: GitRefType.Branch,
  },
  {
    displayName: 'Tag',
    key: GitRefType.Tag,
  },
  {
    displayName: 'Commit',
    key: GitRefType.Commit,
  },
];

export async function listGitRef(params: API.CodeBranchSearchParam) {
  let url = '/apis/front/v1/code/listbranch';
  if (params.refType === 'tag') {
    url = '/apis/front/v1/code/listtag';
  }
  return request<{
    data: string[];
  }>(url, {
    method: 'GET',
    params,
  });
}
