import GroupDetail from '../groups/Detail'
import ApplicationDetail from '../applications/Detail'
import ClusterDetail from '../clusters/Detail'
import NotFount from '@/pages/404'
import {useModel} from "@@/plugin-model/useModel";
import {ResourceType} from '@/const'

export default () => {
  const {initialState} = useModel('@@initialState');
  const {id, type} = initialState?.resource || {};
  if (!id) {
    return <NotFount/>;
  }
  switch (type as ResourceType) {
    case ResourceType.GROUP:
      return (<GroupDetail/>)
    case ResourceType.APPLICATION:
      return (<ApplicationDetail/>);
    case ResourceType.CLUSTER:
      return (<ClusterDetail/>);
    default:
      return <NotFount/>
  }
}
