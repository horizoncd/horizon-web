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
    name: string;
    path: string;
    description?: string;
    visibilityLevel: string;
    parentID?: number;
  };

  type NewApplication = {
    groupID: number,
    name: string;
    description?: string;
    template: {
      name: string,
      release: string,
    }
    git: {
      url: string,
      subfolder: string,
      branch: string
    }
    templateInput: any
  };

  type Application = {
    id: number;
    groupID: number,
    name: string;
    description?: string;
    template: {
      name: string,
      release: string,
    }
    git: {
      url: string,
      subfolder: string,
      branch: string
    }
    templateInput: any
  };

  type Group = {
    id: number;
    name: string;
    fullName: string;
    fullPath: string;
    path: string;
    description?: string;
    visibilityLevel: number;
  };

  type Template = {
    name: string;
    description: string;
  }

  type Release = {
    name: string;
    description: string;
    recommended: boolean;
  }

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
    children?: GroupChild[],
    parentID: number,
  }

  type GroupFilterParam = {
    groupID: number,
    filter?: string,
    pageNumber: number,
    pageSize: number,
  }

}

