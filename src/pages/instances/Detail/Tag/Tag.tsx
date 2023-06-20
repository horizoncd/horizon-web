import { useRequest } from '@@/plugin-request/request';
import { useHistory, useIntl } from 'umi';
import { Button } from 'antd';
import RBAC from '@/rbac';
import {
  getClusterTags,
  updateClusterTags,
} from '@/services/clusters/clusters';
import TagCard from '@/components/tag/TagCard';

interface TagProps {
  clusterID: number,
  clusterFullPath: string,
}

export default function Tag(props: TagProps) {
  const { clusterID, clusterFullPath } = props;

  const intl = useIntl();

  const { data: tags, refresh: refreshTag } = useRequest(() => getClusterTags(clusterID));

  const history = useHistory();

  const manageTagsRoute = `/instaces${clusterFullPath}/-/tags`;

  return (
    <TagCard
      title={(
        <div style={{ display: 'flex' }}>
          {intl.formatMessage({ id: 'pages.tags.normal' })}
        </div>
        )}
      tags={tags?.tags}
      extra={
          (
            <Button
              disabled={!RBAC.Permissions.updateClusterTags.allowed}
              onClick={
                () => history.push({
                  pathname: manageTagsRoute,
                })
              }
            >
              {intl.formatMessage({ id: 'pages.tags.normal.manage' })}
            </Button>
          )
        }
      updateDisabled={!RBAC.Permissions.updateClusterTags.allowed}
      onUpdate={(data) => updateClusterTags(clusterID, data).then(refreshTag)}
    />
  );
}
