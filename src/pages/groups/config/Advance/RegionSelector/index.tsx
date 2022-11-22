import { Card } from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import { useIntl } from 'umi';
import DynamicTagForm, { ValueType } from '@/components/DynamicTagForm';
import { getGroupByID, updateGroupRegionSelector } from '@/services/groups/groups';
import RBAC from '@/rbac';

export default () => {
  const { initialState } = useModel('@@initialState');
  const intl = useIntl();
  const { id } = initialState!.resource;

  const title = (
    <div>
      <div>
        {intl.formatMessage({ id: 'pages.groups.linkK8s' })}
      </div>
      <div style={{ fontWeight: 300, fontSize: 14 }}>
        {intl.formatMessage({ id: 'pages.message.groups.linkK8s' })}
      </div>
    </div>
  );

  return (
    <Card title={title}>
      <DynamicTagForm
        queryTags={() => getGroupByID(id).then(({ data }) => ({
          data: {
            tags: data.regionSelectors,
          },
        }))}
        updateTags={(data) => updateGroupRegionSelector(id, data.tags)}
        valueType={ValueType.Multiple}
        disabled={!RBAC.Permissions.setRegionSelector.allowed}
      />
    </Card>
  );
};
