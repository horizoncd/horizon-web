import React from 'react';
import { Divider } from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import { useIntl } from 'umi';
import { ValueType, DynamicTagForm } from '@/components/tag';
import { getClusterTags, updateClusterTags } from '@/services/clusters/clusters';
import Detail from '@/components/PageWithBreadcrumb';

export default (): React.ReactNode => {
  const { initialState } = useModel('@@initialState');
  const { id: clusterID } = initialState!.resource;
  const intl = useIntl();

  return (
    <Detail>
      <h1>{intl.formatMessage({ id: 'pages.tags.normal.manage' })}</h1>
      <span style={{ color: 'gray' }}>{intl.formatMessage({ id: 'pages.tags.description' })}</span>
      <Divider />
      <DynamicTagForm
        queryTags={() => getClusterTags(clusterID)}
        updateTags={(data) => updateClusterTags(clusterID, data)}
        valueType={ValueType.Single}
      />
    </Detail>
  );
};
