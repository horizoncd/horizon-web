declare namespace PIPELINES {
  type Pipeline = {
    id: number,
    status: string,
    action: string,
    title: string,
    description?: string,
    gitBranch: string,
    gitCommit: string,
    configCommit?: string,
    rollbackFrom?: number,
    createBy: {
      userID: number,
      userName: string
    },
    startedAt: string,
    finishedAt?: string,
  }
}
