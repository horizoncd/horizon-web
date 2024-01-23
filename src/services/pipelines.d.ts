declare namespace PIPELINES {
  type Pipeline = {
    id: number,
    status: string,
    action: string,
    title: string,
    description?: string,
    gitURL: string,
    gitRefType: string,
    gitRef: string,
    gitBranch: string,
    gitTag: string,
    gitCommit: string,
    imageURL: string,
    configCommit?: string,
    rollbackFrom?: number,
    createdBy: {
      userID: number,
      userName: string
    },
    createdAt: string,
    startedAt: string,
    finishedAt: string,
    canRollback: true,
  };

  type Diffs = {
    codeInfo: {
      commitMsg: string
      commitID: string
      link: string
    }
    configDiff: {
      diff: string
    }
  };

  type ListPipelineParam = {
    pageNumber: number,
    pageSize: number,
    canRollback: boolean
    status?: string[]
  };

  type CheckRun = {
    id: number
    name: string
    checkId: uint
    status : string
    pipilineRunId: number
    detailUrl: string
    message: string
    createdAt: string
    updatedAt: string
  };

  type CheckRunFilter = {
    pipelinerunID?: number
    checkID?: number
  };

  type PrMessage = {
    id: number
    pipilineRunId: number
    content: string
    system: boolean
    createdAt: string
    updatedAt: string
    createdBy: {
      id: number
      name: string
      userType?: string
    }
    updatedBy: {
      id: number
      name: string
      userType?: string
    }
  };

}
