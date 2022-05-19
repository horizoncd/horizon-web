declare namespace SYSTEM {
  type Region = {
    name: string;
    displayName: string;
    server: string;
    certificate: string;
    ingressDomain: string;
    harborName: string
  }

  type EnvironmentRegion = {
    id: number,
    region: string,
    regionDisplayName: string,
    environment: string,
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
