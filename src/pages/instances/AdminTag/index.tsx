import React from 'react';
import { Divider } from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import { useIntl } from 'umi';
import { ValueType, DynamicTagForm } from '@/components/tag';

import { getClusterTemplateSchemaTags, updateClusterTemplateSchemaTags } from '@/services/clusters/clusters';
import Detail from '@/components/PageWithBreadcrumb';

export default (): React.ReactNode => {
  const { initialState } = useModel('@@initialState');
  const { id: clusterID } = initialState!.resource;
  const intl = useIntl();

  return (
    <Detail>
      <h1>{intl.formatMessage({ id: 'pages.tags.admin.manage' })}</h1>
      <Divider />
      <DynamicTagForm
        queryTags={() => getClusterTemplateSchemaTags(clusterID)}
        updateTags={(data) => updateClusterTemplateSchemaTags(clusterID, data)}
        valueType={ValueType.Single}
      />
    </Detail>
  );
};
