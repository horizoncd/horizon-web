import { useRequest } from '@@/plugin-request/request';
import { useHistory, useIntl } from 'umi';
import { Button } from 'antd';
import RBAC from '@/rbac';
import {
  getClusterTemplateSchemaTags,
  updateClusterTemplateSchemaTags,
} from '@/services/clusters/clusters';
import TagCard from '@/components/tag/TagCard';

interface AdminTagProps {
  clusterID: number,
  clusterFullPath: string,
}

export default function AdminTag(props: AdminTagProps) {
  const { clusterID, clusterFullPath } = props;

  const intl = useIntl();

  const { data: adminTags, refresh: refreshAdminTag } = useRequest(() => getClusterTemplateSchemaTags(clusterID));

  const history = useHistory();

  const manageAdminTagsRoute = `/clusters${clusterFullPath}/-/admintags`;

  return (
    <TagCard
      title={intl.formatMessage({ id: 'pages.tags.admin' })}
      tags={adminTags?.tags}
      updateDisabled={!RBAC.Permissions.updateTemplateSchemaTags.allowed}
      onUpdate={(data) => updateClusterTemplateSchemaTags(clusterID, data).then(refreshAdminTag)}
      description=""
      extra={
          (
            <Button
              disabled={!RBAC.Permissions.updateTemplateSchemaTags.allowed}
              onClick={
                () => history.push({
                  pathname: manageAdminTagsRoute,
                })
              }
            >
              {intl.formatMessage({ id: 'pages.tags.admin.manage' })}
            </Button>
          )
        }
    />
  );
}
