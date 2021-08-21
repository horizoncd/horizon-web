import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import {Card} from 'antd';
import utils from '../Utils'
import { history } from 'umi';

export default (props: any): React.ReactNode => {
  return (
    <PageContainer header={{
      breadcrumb: {routes: utils.getBreadcrumb(history.location.pathname)}
    }}>
      <Card>
        <div>group Activity</div>
      </Card>
    </PageContainer>
  );
};
