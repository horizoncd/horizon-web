import { request } from 'umi';

// eslint-disable-next-line import/prefer-default-export
export async function listBadges(resourceType: 'clusters' | 'groups' | 'applications', resourceID: number) {
  return request<{
    data: API.Badge[];
  }>(`/apis/core/v2/${resourceType}/${resourceID}/badges`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
