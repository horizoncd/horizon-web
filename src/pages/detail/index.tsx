import GroupDetail from '../groups/Detail'
import NotFount from '@/pages/404'
import { useModel } from "@@/plugin-model/useModel";

export default () => {
  const { initialState } = useModel('@@initialState');
  const { id, type } = initialState?.resource || {};
  if (!id) {
    return <NotFount/>;
  }

  switch (type) {
    case 'group':
      return (<GroupDetail/>)
    default:
      return (<GroupDetail/>);
  }
}
