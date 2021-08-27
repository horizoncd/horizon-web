import GroupDetail from '../groups/Detail'
import NotFount from '@/pages/404'
import { useModel } from "@@/plugin-model/useModel";

export default () => {
  const { initialState } = useModel('@@initialState');
  const { resourceType, resourceId } = initialState || {};
  if (!resourceId) {
    return <NotFount/>;
  }

  switch (resourceType) {
    case 'group':
      return (<GroupDetail id={resourceId}/>)
    default:
      return (<GroupDetail id={resourceId}/>);
  }
}
