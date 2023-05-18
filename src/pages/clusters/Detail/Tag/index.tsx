import { useRequest } from '@@/plugin-request/request';
import { useIntl } from 'umi';
import RBAC from '@/rbac';
import {
  getClusterTags,
  getClusterTemplateSchemaTags,
  updateClusterTags,
  updateClusterTemplateSchemaTags,
} from '@/services/clusters/clusters';
import { MaxSpace } from '@/components/Widget';
import TagCard from '@/components/tag/TagCard';

interface TagProps {
  clusterID: number,
}

export default function Tag(props: TagProps) {
  const { clusterID } = props;

  const intl = useIntl();

  const { data: tags, refresh: refreshTag } = useRequest(() => getClusterTags(clusterID));

  const { data: adminTags, refresh: refreshAdminTag } = useRequest(() => getClusterTemplateSchemaTags(clusterID));

  return (
    <MaxSpace
      direction="vertical"
      size="middle"
    >
      <TagCard
        title={intl.formatMessage({ id: 'pages.tags.normal' })}
        tags={tags?.tags}
        updateDisabled={!RBAC.Permissions.updateClusterTags.allowed}
        onUpdate={(data) => updateClusterTags(clusterID, data).then(refreshTag)}
      />
      <TagCard
        title={intl.formatMessage({ id: 'pages.tags.admin' })}
        tags={adminTags?.tags}
        updateDisabled={!RBAC.Permissions.updateTemplateSchemaTags.allowed}
        onUpdate={(data) => updateClusterTemplateSchemaTags(clusterID, data).then(refreshAdminTag)}
      />
    </MaxSpace>
  );
}
