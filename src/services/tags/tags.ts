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
