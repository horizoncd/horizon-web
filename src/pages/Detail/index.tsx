import { useModel } from '@@/plugin-model/useModel';
import GroupDetail from '../groups/Detail';
import Pods from '../clusters/Pods';
import Clusters from '../applications/Clusters';
import NotFount from '@/pages/404';
import { ResourceType } from '@/const';

export default () => {
  const { initialState } = useModel('@@initialState');
  const { id, type } = initialState?.resource || {};
  if (!id) {
    return <NotFount />;
  }
  switch (type as ResourceType) {
    case ResourceType.GROUP:
      return (<GroupDetail />);
    case ResourceType.APPLICATION:
      return (<Clusters />);
    case ResourceType.CLUSTER:
      return (<Pods />);
    default:
      return <NotFount />;
  }
};
