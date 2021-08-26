import GroupDetail from '../groups/Detail'
import { queryResourceType } from "@/services/core";
import { history, useRequest } from 'umi';

export default () => {
  const { data } = useRequest(() => {
    return queryResourceType(history.location.pathname);
  });

  const { resourceType, resourceId } = data || {};

  switch (resourceType) {
    case 'group':
      return (<GroupDetail id={resourceId} />)
    default:
      return (<GroupDetail id={resourceId} />);
  }
}
