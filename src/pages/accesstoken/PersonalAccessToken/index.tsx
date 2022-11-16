import AccessTokenManagement from '../components/AccessTokenManagement';
import { ComponentWithParamID, PageWithBreadcrumb } from '@/components/Enhancement';

function PersonalAccessToken() {
  return (
    <AccessTokenManagement />
  );
}

export default PageWithBreadcrumb(
  ComponentWithParamID(PersonalAccessToken),
);
