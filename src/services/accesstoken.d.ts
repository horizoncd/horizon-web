declare namespace ACCESSTOKEN {
  type CreatePersonalAccessTokenReq = {
    name: string
    scopes: string[]
    expiresAt: string
  };
  type PersonalAccessToken = CreatePersonalAccessTokenReq & {
    id: number
    createdAt: string
    createdBy: API.User
  };
  type CreatePersonalAccessTokenResp = PersonalAccessToken & {
    token: string
  };

  type CreateResourceAccessTokenReq = CreatePersonalAccessTokenReq & {
    role: string
  };
  type ResourceAccessToken = CreateResourceAccessTokenReq & {
    id: number
    createdAt: string
    createdBy: API.User
  };
  type CreateResourceAccessTokenResp = ResourceAccessToken & {
    token: string
  };
}
