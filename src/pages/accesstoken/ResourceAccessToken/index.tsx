import AccessTokenManagement from '../components/AccessTokenManagement';
import { PageWithInitialState } from '@/components/Enhancement/PageWithInitialState';
import Detail from '@/components/PageWithBreadcrumb';

function ResourceAccessToken(props: { initialState: API.InitialState }) {
  const { initialState } = props;
  const {
    resource: {
      id: resourceID = 0,
      type: resourceType,
    },
    currentUser = { role: '' },
  } = initialState;
  return (
    <Detail>
      <AccessTokenManagement resourceID={resourceID} resourceType={resourceType} role={currentUser.role} resourceScope />
    </Detail>
  );
}

export default PageWithInitialState(ResourceAccessToken);
