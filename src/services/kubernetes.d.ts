declare namespace Kubernetes {
  interface Pod {
    metadata: Metadata;
    spec: Spec;
    status: Status;
  }

  interface Metadata {
    name: string;
    namespace: string;
    creationTimestamp: string;
    deletionTimestamp: string;
    labels: Record<string, string>;
    annotations: Record<string, string>;
    // generateName: string;
    // selfLink: string;
    // uid: string;
    // resourceVersion: string;
    // ownerReferences: OwnerReferences[];
  }

  interface Spec {
    initContainers: Container[];
    containers: Container[];
    // volumes: Volumes[];
    // restartPolicy: string;
    // terminationGracePeriodSeconds: number;
    // dnsPolicy: string;
    // serviceAccountName: string;
    // serviceAccount: string;
    // nodeName: string;
    // securityContext: SecurityContext;
    // schedulerName: string;
    // priorityClassName: string;
    // priority: number;
    // enableServiceLinks: boolean;
    // preemptionPolicy: string;
  }

  interface Status {
    phase: string;
    conditions: Condition[];
    // hostIP: string;
    podIP: string;
    // podIPs: PodIP[];
    // startTime: string;
    // initContainerStatuses: ContainerStatus[];
    containerStatuses: ContainerStatus[];
    // qosClass: string;
    reason: string;
    message: string;
  }

  // interface OwnerReferences {
  //   apiVersion: string;
  //   kind: string;
  //   name: string;
  //   uid: string;
  //   controller: boolean;
  //   blockOwnerDeletion: boolean;
  // }

  // interface Volumes {
  //   name: string;
  //   emptyDir: IEmptyDir;
  // }

  interface Container {
    name: string;
    image: string;
    // command: string[];
    // args: string[];
    // resources: IResources;
    // volumeMounts: VolumeMounts[];
    // terminationMessagePath: string;
    // terminationMessagePolicy: string;
    // imagePullPolicy: string;
    // securityContext: SecurityContext;
  }

  // interface SecurityContext {
  //   supplementalGroups: number[];
  //   fsGroup: number;
  //   capabilities: ICapabilities;
  //   runAsUser: number;
  //   runAsGroup: number;
  // }

  interface Condition {
    type: string;
    status: string;
    message: string;
    lastTransitionTime: string;
  }

  // interface PodIP {
  //   ip: string;
  // }

  interface ContainerStatus {
    name: string;
    state: IState;
    ready: boolean;
    restartCount: number;
    image: string;
    imageID: string;
    containerID: string;
    started?: boolean;
  }

  // interface VolumeMounts {
  //   name: string;
  //   mountPath: string;
  // }

  // interface IEnv {
  //   name: string;
  //   value: string;
  // }

  interface IState {
    terminated?: ITerminated;
    running?: IRunning;
    waiting?: IWaiting
  }

  interface IWaiting {
    reason: string
  }

  interface ILastState {
  }

  // interface ICapabilities {
  //   add: string[];
  // }

  // interface IResources {
  //   limit: ILimits,
  //   request: IRequests,
  // }

  // interface ILimits {
  //   cpu: string;
  //   ['ephemeral-storage']: string;
  //   memory: string;
  // }

  // interface IRequests {
  //   cpu: string;
  //   ['ephemeral-storage']: string;
  //   memory: string;
  // }

  interface ITerminated {
    exitCode: number;
    reason: string;
    startedAt: string;
    finishedAt: string;
    containerID: string;
  }

  interface IRunning {
    startedAt: string;
  }

}
