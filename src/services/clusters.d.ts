declare namespace CLUSTER {
  type PodQuery = {
    // podName=&containerName=(&tailLine=)
    podName: string
    containerName: string
  };

  type SessionQuery = {
    // podName=&containerName=
    podName: string
    containerName: string
  };

  type Environment = {
    name: string;
    displayName: string;
  };

  type Region = {
    name: string;
    displayName: string;
    disabled: boolean;
    isDefault: boolean
  };

  type ClusterFilter = {
    filter?: string;
    pageNumber: number;
    pageSize: number;
    environment?: string
    tagSelector?: string
  };

  type Scope = {
    environment: string;
    region: string;
    regionDisplayName: string;
  };

  type ClusterBase = {
    id: number,
    name: string;
    scope: Scope
    template: {
      name: string;
      release: string;
    };
    tags: TAG.Tag[];
    updatedAt: string;
    createdAt: string;
  };

  type ClusterOutputs = Record<string, ClusterOutput>;

  type ClusterOutput = {
    description: string,
    value: string,
  };

  type Cluster = {
    fullPath: string,
    fullName?: string,
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
    git: API.GitInfo;
    scope: Scope;
    expireTime: string;
    templateInput: any;
    latestDeployedCommit: string;
    status?: string;
    ttlInSeconds: number;
    createdAt: string;
    updatedAt: string;
    createdBy: {
      name: string,
    }
    updatedBy: {
      name: string,
    }
  };

  type ClusterV2 = {
    // basic info
    id: number;
    name: string;
    priority: string;
    description?: string;
    scope: Scope;
    expireTime: string;
    fullPath: string;
    fullName?: string,
    applicationName: string;
    applicationID: string;
    tags: TAG.Tag[];

    // source info
    git: GitInfo;

    // git config info
    buildConfig: any;
    templateInfo: any;
    templateConfig: any;
    manifest: any;

    // status and update info
    status?: string;
    createdAt: string;
    updatedAt: string;
    createdBy: {
      name: string,
    }
    updatedBy: {
      name: string,
    }
    ttlInSeconds?: number,
  };

  type NewCluster = {
    name: string;
    description?: string;
    git: {
      branch: string
    };
    template: {
      release: string,
    },
    templateInput: any
  };

  type NewClusterV2 = {
    name: string;
    description?: string;
    expireTime?: string;
    git: any;
    buildConfig: any;
    templateInfo: any;
    templateConfig: any;
  };

  type UpdateCluster = {
    description?: string;
    git: {
      branch: string;
    };
    templateInput: any
  };

  type UpdateClusterV2 = {
    description?: string;
    expireTime?: string;
    git: any;
    buildConfig: any;
    templateInfo: any;
    templateConfig: any;
  };

  type ClusterBuildDeploy = {
    title: string,
    description?: string;
    git: {
      branch: string;
    };
  };

  type ClusterDeploy = {
    title: string,
    description?: string;
  };

  type ClusterRollback = {
    pipelinerunID: number
  };

  type ClusterDiffs = {
    codeInfo: {
      commitMsg: string
      commitID: string
      link: string
    }
    configDiff: string
  };

  type PodFromBackend = {
    metadata: {
      annotations: Record<string, string>,
      namespace: string
      creationTimestamp: string
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
      reason: string
      message: string
      containerStatuses: [{
        name: string
        ready: boolean
        restartCount: number
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
      lifeCycle: PodLifeCycle[]
    }
    deletionTimestamp: string
  };

  type Revision = {
    pods: Record<string, PodFromBackend>
  };

  type ResourceRef = {
    group: string,
    version: string,
    kind: string,
    namespace: string,
    name: string,
    uid: string,
  };

  type InfoItem = {
    name: string,
    value: string,
  };

  type ResourceNode = {
    podDetail?: Kubernetes.Pod,
    parentRefs: ResourceRef[],
    info: InfoItem[],
    resourceVersion:string,
    images: string[],
    health: string,
    createdAt: string,
  } & ResourceRef;

  type ResourceTree = {
    nodes: Record<string, ResourceNode>
  };

  type Step = {
    index: number,
    total: number,
    replicas: number[],
    manualPaused: boolean,
  };

  type ClusterStatusV2 = {
    status: string,
  };

  type RunningTask = {
    task: string,
    taskStatus?: string,
  };

  type LatestPipelinerun = {
    id: number,
    action: string
  };

  type ClusterBuildStatusV2 = {
    runningTask: RunningTask,
    latestPipelinerun?: {
      id: number,
      action: string
    }
  };

  type ClusterStatus = {
    runningTask: RunningTask,
    latestPipelinerun?: LatestPipelinerun,
    clusterStatus: {
      manualPaused: boolean,
      status: string,
      step?: {
        index: number,
        total: number,
        replicas: string[]
      }
      podTemplateHash?: string,
      replicas?: number,
      versions?: Record<string, {
        replicas: number
        pods: Record<string, PodFromBackend>
      }>
    }
    ttlSeconds: number
  };

  type Event = {
    type: string,
    reason: string,
    message: string,
    count: number,
    eventTimestamp: string,
  };

  type PodInTable = {
    key: string
    podName: string
    state: {
      state: string
      reason: string
      message: string
    }
    ip: string
    onlineStatus: string
    createTime: string
    restartCount?: number
    containerName?: string
    namespace?: string
    events: Event[]
    lifeCycle: PodLifeCycle[]
    deletionTimestamp: string
    annotations: Record<string, string>
    containers: ContainerDetail[]
  };

  type ContainerDetail = {
    name: string,
    image: string,
    env: Env[],
    command: string[],
    args: string[],
    volumeMounts: VolumeMount[],
    status: ContainerStatus
  };

  type Env = {
    name: string,
    value: string,
  };

  type VolumeMount = {
    name: string,
    readOnly: boolean,
    mountPath: string,
    subPath: string,
    volume: Record<string, any>
  };

  type ContainerStatus = {
    ready: boolean,
    restartCount: number,
    started: boolean,
    state: {
      running: {
        startedAt: string
      },
      waiting: {
        reason: string
        message: string
      }
      terminated: {
        exitCode: number
        signal: number
        reason: string
        message: string
        startedAt: string
        finishedAt: string
        containerID: string
      }
    }
  };

  type PodLifeCycle = {
    type: string,
    status: string,
    message: string,
    completeTime?: string,
  };

  type PodContainersQuery = {
    podName: string
  };

  type PodOnlineOfflineResult = {
    result: boolean,
    stdout: string,
    stderr: string,
    errorMsg: string,
    error: {
      ErrStatus: {
        message: string
      }
    }
  };

  type TemplateOptions = {
    value: string,
    label: string,
    isLeaf?: boolean,
    children?: TemplateOptions[],
    loaded?: boolean,
  };

  type GetGrafanaDashboards = {
    host: string,
    params: Record<string, string>,
    dashboards: [GrafanaDashboard]
  };

  type GrafanaDashboard = {
    uid: string,
    title: string,
    tags: [string],
  };
}
