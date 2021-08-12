// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

/** 发送验证码 POST /api/login/captcha */
export async function getFakeCaptcha(
  params: {
    // query
    /** 手机号 */
    phone?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.FakeCaptcha>('/api/login/captcha', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function pmsLogin(params: { redirectUrl: string; fromHost: string }) {
  return request<{
    data: string;
  }>('/api/v1/login', {
    method: 'GET',
    params: {
      ...params,
    },
  });
}

export async function outLogin() {
  return request('/api/v1/logout', {
    method: 'GET',
  });
}

export async function currentUser() {
  return request('/api/v1/status', {
    method: 'GET',
  });
}
