import { Button, Result } from 'antd';
import React from 'react';
import { history } from 'umi';

const Forbidden: React.FC = () => (
  <Result
    status="403"
    title="403"
    subTitle="Sorry, you don't have the permission to visit the page."
    extra={
      <Button type="primary" onClick={() => history.push('/')}>
        Back Home
      </Button>
    }
  />
);

export default Forbidden;
