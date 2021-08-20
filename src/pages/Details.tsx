import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card } from 'antd';

export default (props: any): React.ReactNode => {
  // 这里判断此pathname对应的是Group、App还是实例

  return (
    <PageContainer>
      <Card>
        <div>Details</div>
      </Card>
    </PageContainer>
  );
};
