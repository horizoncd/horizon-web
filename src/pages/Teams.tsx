import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import TableDynamicSettings from './TableDynamicSettings';

const teams = (): React.ReactNode => {
  console.log('kkk');
  return (
    <PageContainer>
      <TableDynamicSettings />
    </PageContainer>
  );
};

export default teams;
