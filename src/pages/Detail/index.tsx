import { useModel } from '@@/plugin-model/useModel';
import GroupDetail from '../groups/Detail';
import Pods from '../instances/Pods';
import Clusters from '../applications/Instances';
import NotFound from '@/pages/404';
import { ResourceType } from '@/const';

export default () => {
  const { initialState } = useModel('@@initialState');
  const { id, type } = initialState?.resource || {};
  if (!id) {
    return <NotFound />;
  }
  switch (type as ResourceType) {
    case ResourceType.GROUP:
      return (<GroupDetail />);
    case ResourceType.APPLICATION:
      return (<Clusters />);
    case ResourceType.INSTANCE:
      return (<Pods />);
    default:
      return <NotFound />;
  }
};
