import React from 'react';
import { Divider } from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import DynamicTagForm, { ValueType } from '@/components/DynamicTagForm';

import { getClusterTags, updateClusterTags } from '@/services/clusters/clusters';
import Detail from '@/components/PageWithBreadcrumb';

export default (): React.ReactNode => {
  const { initialState } = useModel('@@initialState');
  const { id: clusterID } = initialState!.resource;

  return (
    <Detail>
      <h1>标签管理</h1>
      <Divider />
      <DynamicTagForm
        queryTags={() => getClusterTags(clusterID)}
        updateTags={(data) => updateClusterTags(clusterID, data)}
        valueType={ValueType.Single}
      />
    </Detail>
  );
};
