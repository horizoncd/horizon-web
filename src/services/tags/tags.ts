import { request } from 'umi';

export async function querySubresourceTags(resourceType: string, resourceID: number) {
  return request<{
    data: {
      tags: TAG.Tag[]
    };
  }>(`/apis/core/v1/${resourceType}/${resourceID}/subresourcetags`, {
    method: 'GET',
  });
}

export async function getMetaTagKeys() {
  return request<{
    data: string[]
  }>('/apis/core/v2/metatagkeys', {
    method: 'GET',
  });
}

export async function getMetatagsByKey(key: string) {
  return request<{
    data: TAG.MetaTag[]
  }>('/apis/core/v2/metatags', {
    method: 'GET',
    params: { key },
  });
}
