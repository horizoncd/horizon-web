declare namespace Webhooks {
  type CreateOrUpdateWebhookReq = {
    url: string
    enabled: boolean
    description: string
    sslVerifyEnabled: boolean
    secret: string
    triggers: string[]
  };

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
    trigger: string
    status: string
    errorMessage: string
    resourceType: string
    resourceName: string
    resourceID: number
    eventType: string
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
