import { Card } from 'antd';
import React, { useState } from 'react';
import AppList from './AppList';
import ClusterList from './ClusterList';
import TemplateList from './TemplateList';

const tabList = [
  {
    key: 'apps',
    tab: 'applications',
  },
  {
    key: 'clusters',
    tab: 'clusters',
  },
  {
    key: 'templates',
    tab: 'templates',
  },
];

export default function ResourceTabs(props: { userID: number }) {
  const { userID } = props;
  const [activeKey, setActiveKey] = useState('apps');

  const contents: Record<string, React.ReactNode> = {
    apps: <AppList userID={userID} />,
    clusters: <ClusterList userID={userID} />,
    templates: <TemplateList userID={userID} />,
  };

  return (
    <Card
      style={{ width: '100%' }}
      title="Resources"
      tabList={tabList}
      activeTabKey={activeKey}
      onTabChange={setActiveKey}
    >
      {contents[activeKey]}
    </Card>
  );
}
