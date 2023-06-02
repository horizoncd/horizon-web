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
    fullName: string;
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
    isAdmin: boolean,
    isBanned: boolean,
    phone: string,
    updatedAt: string,
    createdAt: string,
  };

  type AuthEndpoint = {
    id: number,
    displayName: string,
    authURL: string,
  };

  type IDP = {
    id: number,
    displayName: string,
    name: string,
    avatar: string,
    authorizationEndpoint: string,
    tokenEndpoint: string,
    userinfoEndpoint: string,
    revocationEndpoint: string,
    issuer: string,
    scopes: string,
    tokenEndpointAuthMethod: string,
    jwks: string,
    clientID: string,
    createdAt: string,
    updatedAt: string,

  };

  type Link = {
    id: number,
    sub: string,
    idpId: number,
    userId: number,
    name: string,
    email: string,
    unlinkable: boolean,
  };

  type AppSchemeConfigs = {
    application: any
    pipeline: any
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
    tags: TAG.Tag[];
    git: GitInfo;
    templateInput: any;
    createdAt: string;
    updatedAt: string;
  };

  type BuildSchema = {
    jsonSchema?: any;
    uiSchema?:any;
  };

  type TemplateInfoV2 = {
    name: string;
    release: string;
  };
  type GetApplicationResponseV2 = {
    id: number;
    name: string;
    description: string;
    priority: string;
    tags: TAG.Tag[];
    git: GitInfo;

    image?: string;

    buildConfig: any;
    templateInfo?: TemplateInfoV2;
    templateConfig?: any;
    manifest?: any;

    fullPath: string;
    groupID: number;
    createdAt: string;
    updatedAt: string;
  };

  type CreateOrUpdateRequestV2 = {
    name: string
    description: string
    priority: string;
    tags?: Tag[];
    git?: GitInfo;
    image?: string;
    buildConfig?: any;
    templateInfo?: TemplateInfoV2;
    templateConfig?: any;
  };

  type CreateApplicationResponseV2 = {
    id: string
    fullPath: string;
    groupID: number;
    createdAt: string;
    updatedAt: string;
  };

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
    desc: string,
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

  type Tag = {
    key: string,
    value: string,
  };

  type Tags = {
    tags: Tag[],
  };

  type PipelineStats = {
    pipelinerunID: number,
    application: string,
    cluster: string,
    pipeline: string,
    result: string,
    duration: number,
    tasks?: [TaskStats],
    startedAt: string,
  };

  type TaskStats = {
    task: string,
    result: string,
    duration: number,
    steps?: [StepStats]
  };

  type AuthEndpoint = {
    authURL: string,
    displayName: string,
  };

  type StepStats = {
    step: string,
    result: string,
    duration: number,
  };

  interface IDP {
    id: number,
    displayName: string,
    name: string,
    avatar: string,
    authorizationEndpoint: string,
    tokenEndpoint: string,
    userinfoEndpoint: string,
    revocationEndpoint: string,
    issuer: string,
    scopes: string,
    tokenEndpointAuthMethod: string,
    jwks: string,
    clientID: string,
    clientSecret: string,
    createdAt: string,
    updatedAt: string,
  }

  interface CreateIDPParam extends IDP {
    id?: number,
  }

  interface UpdateIDPParam extends IDP {
    id?: number,
  }

  export type GitInfo = {
    url: string
    subfolder: string
    branch: string
    tag: string
    commit: string
  };

}
