declare namespace SYSTEM {
  type Region = {
    id: number,
    name: string;
    displayName: string;
    server: string;
    certificate: string;
    ingressDomain: string;
    prometheusURL: string;
    registryID: number
    registry: Registry
    disabled: boolean
    createdAt: string,
    updatedAt: string,
  };

  type Environment = {
    id: number,
    name: string,
    displayName: string,
    autoFree: boolean,
    createdAt: string,
    updatedAt: string,
  };

  type EnvironmentRegion = {
    id: number,
    regionName: string,
    regionDisplayName: string,
    environmentName: string,
    disabled: boolean,
    isDefault: boolean,
    createdAt: string,
    updatedAt: string,
  };

  type Registry = {
    id: number,
    name: string,
    server: string,
    path: string,
    token: string,
    insecureSkipTLSVerify: boolean,
    kind: string,
    createdAt: string,
    updatedAt: string,
  };
}
