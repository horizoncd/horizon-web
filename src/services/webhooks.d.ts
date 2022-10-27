declare namespace Webhooks {
  type Resource = {
    resourceType: string
    resourceID: number
  };

  type UpdateWebhookReq = {
    url?: string
    enabled?: boolean
    description?: string
    sslVerifyEnabled?: boolean
    secret?: string
    triggers?: string[]
  };

  type CreateWebhookReq = Required<UpdateWebhookReq>;

  type Webhook = CreateWebhookReq & {
    id: number
    createdAt: string
    updatedAt: string
    createdBy: API.User
    updatedBy: API.User
  };

  type LogSummary = {
    id: number
    webhookID: number
    eventID: number
    url: string
    status: string
    errorMessage: string
    createdAt: string
    updatedAt: string
    createdBy: API.User
    updatedBy: API.User
  };

  type Log = LogSummary & {
    requestHeaders: string
    requestData: string
    responseHeaders: string
    responseBody: string
  };
}
