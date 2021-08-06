import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import TableDynamicSettings from '../TableDynamicSettings';
import { Row, Col } from 'antd';

const index = (): React.ReactNode => {
  return (
    <Row>
      <Col span={2} />
      <Col span={20}>
        <PageContainer>
          <TableDynamicSettings />
        </PageContainer>
      </Col>
      <Col span={2} />
    </Row>
  );
};

export default index;
