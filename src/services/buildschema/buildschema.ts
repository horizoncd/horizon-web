import {request} from 'umi';
import type {API} from '../typings';

export  async function getBuildSchema(){
  return request<{
    data: API.BuildSchema;
  }>(`/apis/front/v2/buildschema`, {
    method: 'GET',
  });
}
