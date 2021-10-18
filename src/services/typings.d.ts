// @ts-ignore
/* eslint-disable */
declare namespace API {
  type CurrentUser = {
    name: string;
    id: number
  };

  type Resource = {
    id: number;
    type: string;
    name: string;
    fullName: string;
    fullPath: string;
  };

  type NewGroup = {
    name: string;
    path: string;
    description?: string;
    visibilityLevel: string;
    parentID?: number;
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

  type Application = {
    id: number;
    groupID: number;
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

  type Group = {
    id: number;
    name: string;
    fullName: string;
    fullPath: string;
    path: string;
    description?: string;
    visibilityLevel?: number;
  };

  type Template = {
    name: string;
    description: string;
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
    groupID: number;
    filter?: string;
    pageNumber: number;
    pageSize: number;
  };

  type Environment = {
    name: string;
    displayName: string;
  };

  type Region = {
    name: string;
    displayName: string;
  };

  type ClusterFilter = {
    filter?: string;
    pageNumber: number;
    pageSize: number;
    env: string
  };

  type ClusterBaseInfo = {
    id: number,
    name: string;
    scope: {
      env: string;
      region: string;
    };
    template: {
      name: string;
      release: string;
    };
  }

  type NewCluster = {
    name: string;
    description?: string;
    git: {
      branch: string;
    };
    templateInput: any
  }

  type UpdateCluster = {
    description?: string;
    git: {
      branch: string;
    };
    templateInput: any
  }

  type ClusterBuildDeploy = {
    title: string,
    description?: string;
    git: {
      branch: string;
    };
  }

  type ClusterDeploy = {
    title: string,
    description?: string;
  }

  type ClusterRollback = {
    pipelinerunID: string
  }

  type ClusterDiffs = {
    codeDiff: {
      commit: {
        source: {
          id: string
        };
        target: {
          id: string;
          log: string;
        }
      },
      link: string
    }
    configDiff: [{
      oldPath: string
      newPath: string
      aMode: string
      bMode: string
      newFile: boolean
      renamedFile: boolean
      deletedFile: boolean
      diff: string
    }]
  }

  type Pipelinerun = {
    id: number,
    status: string,
    action: string,
    title: string,
    description: string,
    codeBranch: string,
    codeCommit: string,
    configCommit: string,
    rollbackFrom: number,
    createdBy: string,
    startedAt: number,
    finishedAt: number,
  }

  type ClusterStatus = {
    runningTask: {
      task: string,
      pipelinerunID: number,
      taskStatus: string,
    }
    clusterStatus: {
      status: string,
      step: {
        index: number,
        total: number,
      }
      podTemplateHash: string,
      replicas: number,
      versions: any
    }
    versions: {
      [index: string]: {
        replicas: number
        pods: {
          [index: string]: {
            metadata: {
              namespace: string
            }
            spec: {
              nodeName: string,
              initContainers: [{
                name: string,
                image: string,
              }]
              containers: [{
                name: string,
                image: string,
              }]
            }
            status: {
              hostIP: string,
              podIP: string
              phase: string
              containerStatuses: [{
                name: string
                ready: boolean
                state: {
                  state: string
                  reason: string
                  message: string
                }
              }]
              events: [{
                type: string
                reason: string
                message: string
                count: number
                eventTimestamp: string
              }]
            }
          }
        }
      };
    }
  }
}
