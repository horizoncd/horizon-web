declare namespace SYSTEM {
  type Region = {
    id: number,
    name: string;
    displayName: string;
    server: string;
    certificate: string;
    ingressDomain: string;
    harborID: number
    harbor: Harbor
    disabled: boolean
    createdAt: string,
    updatedAt: string,
  }

  type Environment = {
    name: string,
    displayName: stirng,
    createdAt: string,
    updatedAt: string,
  }

  type EnvironmentRegion = {
    id: number,
    regionName: string,
    regionDisplayName: string,
    environmentName: string,
    disabled: boolean,
    isDefault: boolean,
    createdAt: string,
    updatedAt: string,
  }

  type Harbor = {
    id: number,
    name: string,
    server: string,
    token: string,
    preheatPolicyID: number,
    createdAt: string,
    updatedAt: string,
  }
}
