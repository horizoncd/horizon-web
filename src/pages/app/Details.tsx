import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card } from 'antd';

export default (props: any): React.ReactNode => {
  console.log(props)
  return (
    <PageContainer>
      <Card>
        <div>app Details</div>
      </Card>
    </PageContainer>
  );
};
