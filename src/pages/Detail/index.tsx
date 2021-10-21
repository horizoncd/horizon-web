import GroupDetail from '../groups/Detail'
import ApplicationDetail from '../applications/Detail'
import NotFount from '@/pages/404'
import {useModel} from "@@/plugin-model/useModel";
import {ResourceType} from '@/const'

export default () => {
  const {initialState} = useModel('@@initialState');
  const {id, type} = initialState?.resource || {};
  if (!id) {
    return <NotFount/>;
  }

  switch (type) {
    case ResourceType.GROUP:
      return (<GroupDetail/>)
    default:
      return (<ApplicationDetail/>);
  }
}
