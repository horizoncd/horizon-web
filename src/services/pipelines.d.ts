declare namespace PIPELINES {
  type Pipeline = {
    id: number,
    status: string,
    action: string,
    title: string,
    description?: string,
    codeBranch?: string,
    codeCommit?: string,
    configCommit?: string,
    rollbackFrom?: number,
    createdBy: string,
    startedAt: string,
    finishedAt?: string,
  }
}
