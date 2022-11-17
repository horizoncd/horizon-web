import { history } from '@@/core/history';
import { Spin } from 'antd';
import { useRequest } from 'umi';
import { loginCallback } from '@/services/login/login';
import { RedirectURL } from '@/const';

export default () => {
  const { code } = history.location.query;
  let { state } = history.location.query;
  state = window.atob(state);
  const params = new URLSearchParams(state);
  let redirect = params.get('redirect');
  if (redirect === null) {
    const u = new URL(window.location.pathname.toString());
    u.pathname = '/';
    redirect = u.toString();
  }
  params.set('redirect', redirect);
  useRequest(
    () => loginCallback(code, window.btoa(params.toString()), RedirectURL),
    {
      onSuccess: () => {
        window.location.href = redirect;
      },
      onError: () => {
        history.push('/user/login');
      },
    },
  );

  return (
    <Spin style={{
      float: 'left',
      marginLeft: '50%',
      marginTop: '50%',
    }}
    />
  );
};
