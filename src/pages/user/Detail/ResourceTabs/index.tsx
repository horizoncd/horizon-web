import { Card } from 'antd';
import React, { useState } from 'react';
import { useIntl } from 'umi';
import Intl from '@/components/Intl';
import AppList from './AppList';
import ClusterList from './ClusterList';
import TemplateList from './TemplateList';

const tabList = [
  {
    key: 'apps',
    tab: <Intl id="pages.header.applications" />,
  },
  {
    key: 'clusters',
    tab: <Intl id="pages.header.clusters" />,
  },
  {
    key: 'templates',
    tab: <Intl id="pages.header.templates" />,
  },
];

export default function ResourceTabs(props: { userID: number }) {
  const { userID } = props;
  const [activeKey, setActiveKey] = useState('apps');
  const intl = useIntl();

  const contents: Record<string, React.ReactNode> = {
    apps: <AppList userID={userID} />,
    clusters: <ClusterList userID={userID} />,
    templates: <TemplateList userID={userID} />,
  };

  return (
    <Card
      style={{ width: '100%' }}
      title={intl.formatMessage({ id: 'pages.profile.resources' })}
      tabList={tabList}
      activeTabKey={activeKey}
      onTabChange={setActiveKey}
    >
      {contents[activeKey]}
    </Card>
  );
}
