import type { GitInfo } from '@/services/code/code';
// @ts-ignore
declare namespace API {
  interface InitialState {
    settings?: Partial<LayoutSettings>;
    currentUser?: API.CurrentUser;
    roles?: API.Role[];
    fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
    resource: API.Resource;
    accordionCollapse: boolean;
  }

  type CurrentUser = {
    name: string;
    id: number;
    isAdmin: boolean;
    role: string;
  };

  type Resource = {
    id: number;
    type: string;
    name: string;
    fullName: string;
    fullPath: string;
    parentID: number;
  };

  type NewGroup = {
    name: string;
    path: string;
    description?: string;
    visibilityLevel: string;
    parentID?: number;
  };

  type NewOauthApp = {
    name: string;
    desc: string;
    homeURL: string;
    redirectURL: string;
  };

  type APPBasicInfo = {
    appID: number;
    clientID: string;
    appName: string;
    desc: string;
    homeURL: string;
    redirectURL: string;
  };

  type OauthClientSecretInfo = {
    id: number
    clientID: string
    clientSecret: string
    createdAt: string
    createdBy: string
  };

  type NewApplication = {
    name: string;
    priority: string;
    description?: string;
    template: {
      name: string;
      release: string;
    };
    git: {
      url: string;
      subfolder: string;
      branch: string;
    };
    templateInput: any;
  };

  type NewMember = {
    // ResourceType group/application/applicationInstance
    resourceType: string,
    // ResourceID group id;application id ...
    resourceID: number,
    // MemberNameID group id / userid
    memberNameID: number,
    // MemberType user or group
    memberType: number
    // Role owner/maintainer/develop/...
    role: string,
  };

  type UpdateMember = {
    // ResourceType group/application/applicationInstance
    id: number,
    // Role owner/maintainer/develop/...
    role: string,
  };

  type Member = {
    // ID the uniq id of the member entry
    id: number,
    // MemberType user or group
    memberType: string,
    memberName: string
    memberNameID: number,
    // ResourceName   application/group
    resourceType: string,
    resourceName: string,
    resourcePath: string,
    resourceID: number,
    // Role the role name that bind
    role: string,
    // GrantBy id of user who grant the role
    grantedBy: number,
    // GrantorName name of user who grant the role
    grantorName: string,
    // GrantTime
    grantTime: string,
  };

  type User = {
    id: number,
    name: string,
    fullName: string,
    email: string,
  };

  type Application = {
    id: number;
    groupID: number;
    fullPath: string
    fullName?: string
    name: string;
    priority: string;
    description?: string;
    template: {
      name: string;
      release: string;
      recommendedRelease: string;
    };
    git: GitInfo;
    templateInput: any;
    createdAt: string;
    updatedAt: string;
  };

  type BuildSchema = {
    jsonSchema?: any;
    uiSchema?:any;
  }

  type TemplateInfoV2  = {
    name: string;
    release: string;
  }
  type GetApplicationResponse2 = {
    id: number;
    name: string;
    description: string;
    priority: string;
    git: GitInfo;

    buildConfig: any;
    templateInfo?: TemplateInfoV2;
    templateConfig?: any;
    manifest?: any;

    fullPath: string;
    groupID: number;
    createdAt: string;
    updatedAt: string;
  }

  type CreateOrUpdateRequestV2 = {
    name: string
    description: string
    priority: string;
    git?: GitInfo;
    buildConfig?: any;
    templateInfo?: TemplateInfoV2;
    templateConfig?: any;
  }

  type CreateApplicationResponseV2 = {
    id: string
    fullPath: string;
    groupID: number;
    createdAt: string;
    updatedAt: string;
  }


  // eslint-disable-next-line @typescript-eslint/naming-convention
  type regionSelectors = [{
    key: string,
    values: string[]
  }];

  type Group = {
    id: number;
    name: string;
    fullName: string;
    fullPath: string;
    path: string;
    regionSelectors: regionSelectors
    description?: string;
    visibilityLevel?: number;
  };

  type Template = {
    name: string;
    description?: string;
  };

  type Release = {
    name: string;
    description: string;
    recommended: boolean;
  };

  type PageResult<T> = {
    total: number;
    items: T[];
  };

  type GroupChild = {
    id: number;
    name: string;
    fullName: string;
    description?: string;
    path: string;
    type: string;
    childrenCount: number;
    children?: GroupChild[];
    parentID: number;
  };

  type GroupFilterParam = {
    groupID?: number;
    filter?: string;
    pageNumber: number;
    pageSize: number;
  };

  type PageParam = {
    pageNumber: number,
    pageSize: number,
    filter?: string,
    // isConcat为true表示保留上一页列表（如下拉列表滚动翻页），为false表示直接翻页。
    // todo:看下有没有其他实现方法
    isConcat?: boolean,
    environment?: string,
    template?: string,
    templateRelease?: string,
  };

  type RoleRule = {
    verbs: string[],
    apiGroups: string[],
    resources: string[],
    scopes: string[],
    nonResourceURLs: string[],
  };

  type Role = {
    name: string,
    rules: RoleRule[]
  };

  type CodeBranchSearchParam = {
    refType: string,
    giturl: string,
    pageNumber: number,
    pageSize: number,
    filter?: string,
  };

  type TemplateSchemaParam = {
    clusterID?: number,
    resourceType?: string,
  };

  type SLODashboards = {
    overview: string;
    history: string;
  };

  type Tag = {
    key: string,
    value: string,
  };

  type Tags = {
    tags: Tag[],
  };
}

