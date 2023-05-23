import React from 'react';
import { Divider } from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import { useIntl } from 'umi';
import { ValueType, DynamicTagForm } from '@/components/tag';
import Detail from '@/components/PageWithBreadcrumb';
import { getApplicationTags, updateApplicationTags } from '@/services/applications/applications';

export default (): React.ReactNode => {
  const { initialState } = useModel('@@initialState');
  const { id: applicationID } = initialState!.resource;
  const intl = useIntl();

  return (
    <Detail>
      <h1>{intl.formatMessage({ id: 'pages.tags.normal.manage' })}</h1>
      <Divider />
      <DynamicTagForm
        queryTags={() => getApplicationTags(applicationID)}
        updateTags={(data) => updateApplicationTags(applicationID, data)}
        valueType={ValueType.Single}
      />
    </Detail>
  );
};
