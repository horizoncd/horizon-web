import { Redirect } from 'umi'
import {useModel} from "@@/plugin-model/useModel";
import {history} from "@@/core/history";

export default (props: any) => {
  const {initialState} = useModel('@@initialState');

  if (!initialState?.currentUser?.isAdmin && history.location.pathname.startsWith("/admin/")) {
    return <Redirect to="/403" />;
  } else {
    return <div>{ props.children }</div>;
  }
}
