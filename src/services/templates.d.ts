declare namespace Templates {
    type Template = {
    	id: number
      name: string
      chartName: string
      description?: string
      repository: string
      group: number
      fullpath?: string
      createAt: string
      updateAt: string
      createdBy: number
      updatedBy: number
      releases: Release[]
    };

    type Release = {
      id: number
      name: string
      description: string
      recommended: boolean
      templateID: number,
      commitID: string,
      chartVersion: string,
      syncStatus: string,
      syncStatusCode: StatusCode,
      lastSyncAt: string,
      failedReason: string,
      createdBy?: number
      updatedBy?: number
      createAt: string
      updateAt: string
    };

    enum StatusCode {
      StatusSucceed = 1,
      StatusUnknown,
      StatusFailed,
      StatusOutOfSync,
    }

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
