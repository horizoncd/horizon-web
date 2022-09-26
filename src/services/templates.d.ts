declare namespace Templates {
  type Template = {
    id: number
    name: string
    chartName: string
    description?: string
    repository: string
    group: number
    fullPath?: string
    fullName: string
    createdAt: string
    updatedAt: string
    createdBy: number
    updatedBy: number
    releases?: Release[]
  };

  type Release = {
    id: number
    name: string
    description: string
    recommended: boolean
    templateID: number,
    templateName: string,
    commitID: string,
    chartVersion: string,
    syncStatus: string,
    syncStatusCode: StatusCode,
    lastSyncAt: string,
    failedReason: string,
    createdBy?: number
    updatedBy?: number
    createdAt: string
    updatedAt: string
  };

  type CreateTemplateRequest = {
    name: string
    release: CreateReleaseRequest
    description?: string

    repository: string
    token: string
  };

  type CreateReleaseRequest = {
    name: string
    isRecommend: bool
    description?: string
  };

  type UpdateTemplateRequest = {
    description: string
    repository: string
    token: string
  };

  type UpdateReleaseRequest = {
    isRecommend: bool
    description: string
  };
}
