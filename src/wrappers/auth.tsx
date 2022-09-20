import { useModel } from '@@/plugin-model/useModel';
import { history } from '@@/core/history';
import Forbidden from '@/pages/403';

export default (props: any) => {
  const { initialState } = useModel('@@initialState');

  if (!initialState?.currentUser?.isAdmin && history.location.pathname.startsWith('/admin/')) {
    return <Forbidden />;
  }
  return <div>{ props.children }</div>;
};
