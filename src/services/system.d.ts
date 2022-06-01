declare namespace SYSTEM {
  type Region = {
    id: number,
    name: string;
    displayName: string;
    server: string;
    certificate: string;
    ingressDomain: string;
    harborID: number
    harborName: string
  }

  type Environment = {
    name: string,
    displayName: stirng,
  }

  type EnvironmentRegion = {
    id: number,
    regionName: string,
    regionDisplayName: string,
    environmentName: string,
    disabled: boolean,
    isDefault: boolean,
  }

  type Harbor = {
    id: number,
    name: string,
    server: string,
    token: string,
    preheatPolicyID: number,
  }
}
