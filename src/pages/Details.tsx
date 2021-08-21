import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import {Button, Card} from 'antd';
import utils from './Utils'
import { history } from 'umi';

export default (): React.ReactNode => {
  const { pathname } = history.location;
  const resourceName = utils.getResourceName(pathname)
  const header = () => {
    return (<Button type="primary" style={{backgroundColor: '#1f75cb'}}>New subgroup</Button>)
  }

  return (
    <PageContainer
      header={{
        breadcrumb: {routes: utils.getBreadcrumb(pathname)},
        title: resourceName,
        extra: header()
      }}
      style={{paddingLeft: 35, paddingRight: 35}}
      tabList={[
        {
          tab: 'Subgroups',
          key: 'Subgroups',
        },
      ]}
    >
      <Card>
        <div>Details</div>
      </Card>
    </PageContainer>
  );
};
