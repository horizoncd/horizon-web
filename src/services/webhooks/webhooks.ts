import { request } from 'umi';

export async function listWebhooks(resourceType: string, resourceID: number, params: API.PageParam) {
  return request<{
    data: API.PageResult<Webhooks.Webhook>;
  }>(`/apis/core/v1/${resourceType}/${resourceID}/webhooks`, {
    method: 'GET',
    params,
  });
}

export async function getWebhook(id: number) {
  return request<{
    data: Webhooks.Webhook
  }>(`/apis/core/v1/webhooks/${id}`, {
    method: 'GET',
  });
}

export async function createWebhook(resourceType: string, resourceID: number, data: Webhooks.CreateOrUpdateWebhookReq) {
  return request<{
    data: Webhooks.Webhook;
  }>(`/apis/core/v1/${resourceType}/${resourceID}/webhooks`, {
    method: 'POST',
    data,
  });
}

export async function updateWebhook(id: number, data: Webhooks.CreateOrUpdateWebhookReq) {
  return request<{
    data: Webhooks.Webhook;
  }>(`/apis/core/v1/webhooks/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function enableOrDisableWebhook(id: number, enabled: boolean) {
  return request<{
    data: Webhooks.Webhook;
  }>(`/apis/core/v1/webhooks/${id}`, {
    method: 'PUT',
    data: {
      enabled,
    },
  });
}

export async function deleteWebhook(id: number) {
  return request(`/apis/core/v1/webhooks/${id}`, {
    method: 'DELETE',
  });
}

export async function listWebhookLogs(webhookID: number, params: API.PageParam) {
  return request<{
    data: API.PageResult<Webhooks.LogSummary>;
  }>(`/apis/core/v1/webhooks/${webhookID}/logs`, {
    method: 'GET',
    params,
  });
}

export async function getWebhookLog(id: number) {
  return request<{
    data: Webhooks.Log;
  }>(`/apis/core/v1/webhooklogs/${id}`, {
    method: 'GET',
  });
}

export async function resendWebhookLogs(id: number) {
  return request<{
    data: Webhooks.Log;
  }>(`/apis/core/v1/webhooklogs/${id}/resend`, {
    method: 'POST',
  });
}
