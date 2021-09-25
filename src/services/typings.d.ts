// @ts-ignore
/* eslint-disable */
declare namespace API {
  type CurrentUser = {
    name: string;
  }

  type Resource = {
    id: number;
    type: string;
    name: string;
    fullName: string;
    fullPath: string;
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

  type GroupPageResult = {
    total: int,
    items: GroupChild[]
  }

  type Group = {
    id: number;
    name: string;
    fullName: string;
    fullPath: string;
    path: string;
    description?: string;
    visibilityLevel: number;
  };

  type PageResult<T> = {
    total: number,
    items: T[]
  }

  type GroupChild = {
    id: number,
    name: string,
    fullName: string,
    description?: string,
    path: string,
    type: string,
    childrenCount: number,
    subGroupCount: number,
    applicationCount: number,
    children?: GroupChild[],
    parentId: number,
  }

  type GroupFilterParam = {
    parentId: number,
    filter?: string,
    pageNumber?: number,
    pageSize?: number,
  }

}

