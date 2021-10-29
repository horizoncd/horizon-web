declare namespace CLUSTER {
  type PodQuery = {
    // namespace=&podName=&containerName=&environment=
    namespace: string
    podName: string
    containerName: string
    environment: string
  }

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
    environment: string
  };

  type Scope = {
    environment: string;
    region: string;
  }

  type ClusterBase = {
    id: number,
    name: string;
    scope: Scope
    template: {
      name: string;
      release: string;
    };
  }

  type Cluster = {
    fullPath: string,
    application: {
      id: number,
      name: string
    };
    id: number
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
      commit: string;
    };
    scope: Scope
    templateInput: any;
  };

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

  type PodFromBackend = {
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
      versions: Record<string, {
        replicas: number
        pods: Record<string, PodFromBackend>
      }>
    }
  }

  type PodInTable = {
    podName: string
    status: string
    ip: string
    onlineStatus: string
    createTime?: string
    restartCount?: number
    containerName?: string
    namespace?: string
  }

}
