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
  };
}
