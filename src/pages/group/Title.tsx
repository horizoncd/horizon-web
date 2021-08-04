import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card } from 'antd';
import { useLocation } from 'umi';
import { useRouteMatch } from 'umi';

export default (props: any): React.ReactNode => {
  const location = useLocation();
  const match = useRouteMatch();
  return (
    <PageContainer>
      <Card>
        <div>
          <ul>
            <li>Title</li>
            <li>location: {location.pathname}</li>
            <li>match: {JSON.stringify(match)}</li>
            <li>match: {JSON.stringify(props.route)}</li>
          </ul>
        </div>
      </Card>
    </PageContainer>
  );
};
