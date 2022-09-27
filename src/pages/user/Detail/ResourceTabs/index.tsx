import { Tabs } from 'antd';
import AppList from './AppList';
import ClusterList from './ClusterList';
import TemplateList from './TemplateList';

const { TabPane } = Tabs;

export default function ResourceTabs(props: { userID: number }) {
  const { userID } = props;

  return (
    <Tabs>
      <TabPane tab="Applications" key="app">
        <AppList userID={userID} />
      </TabPane>
      <TabPane tab="Clusters" key="cluster">
        <ClusterList userID={userID} />
      </TabPane>
      <TabPane tab="Tempaltes" key="templates">
        <TemplateList userID={userID} />
      </TabPane>
    </Tabs>
  );
}
