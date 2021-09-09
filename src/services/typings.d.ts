// @ts-ignore
/* eslint-disable */
declare namespace API {
  type CurrentUser = {
    name: string;
  }

  type Resource = {
    id?: number;
    name?: string;
    type?: string;
    path?: string;
  }

  type NewGroup = {
    name: groupName;
    path: groupPath;
    description?: groupDescription;
    visibilityLevel: visibilityLevel;
    parentId?: groupId;
  };

  type Data = {
    data: Group
  }

  type Group = {
    id: string;
    name: string;
    path: string;
    description?: string;
    visibilityLevel: number;
  };

  type GroupChild = {
    id: number,
    name: string,
    description?: string,
    path: string,
    type: string,
    childrenCount: number,
    subGroupCount: number,
    applicationCount: number,
    children?: GroupChild[],
    parentId?: number,
    createTime: Date,
    modifyTime: Date,
  }

  type GroupFilterParam = {
    parentId?: string,
    filter?: string,
    pageIndex?: number,
    pageSize?: number,
  }

}

