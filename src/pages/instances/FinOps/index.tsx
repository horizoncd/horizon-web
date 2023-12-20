import React from 'react';
import { useModel } from '@@/plugin-model/useModel';
import { Card, Modal } from 'antd';
import { MicroApp } from '@/components/Widget';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';

export default (): React.ReactNode => {
  const { initialState } = useModel('@@initialState');
  const { id, name, fullPath } = initialState!.resource;
  const { errorAlert } = useModel('alert');

  return (
    <PageWithBreadcrumb>
      <MicroApp
        style={{ width: '100%' }}
        name="finopsconfirm"
        clusterID={id}
        clusterName={name}
        fullPath={fullPath}
        errorAlert={errorAlert}
        card={Card}
        modal={Modal}
      />
    </PageWithBreadcrumb>
  );
};
