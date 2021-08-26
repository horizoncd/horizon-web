// @ts-ignore
/* eslint-disable */
declare namespace API {
  type CurrentUser = {
    name: string;
  }

  type Group = {
    title: string;
    key: string;
    path?: string
    children?: Group[]
  }

  type GroupChild = {
    id: string,
    name: string,
    description: string,
    path: string,
    type: string,
    subGroupCount: number,
    applicationCount: number,
    createTime: Date,
    modifyTime: Date,
  }

  type GroupFilterParam = {
    parentId?: string,
    filter?: string,
    pageIndex: number,
    pageSize: number,
  }

}

