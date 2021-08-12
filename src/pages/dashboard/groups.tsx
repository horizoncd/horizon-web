import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Col, Divider, Input, Row, Tabs, Tree } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { history, useModel } from 'umi';
import { DataNode, EventDataNode, Key } from 'rc-tree/lib/interface';

const { DirectoryTree } = Tree;
const { Search } = Input;
const { TabPane } = Tabs;

export default (): React.ReactNode => {
  // @ts-ignore
  const { groups, queryGroup } = useModel('groups', (model) => ({
    groups: model.groups,
    queryGroup: model.queryGroup,
  }));
  queryGroup();

  const { setInitialState } = useModel('@@initialState');
  const onSelect = (
    selectedKeys: Key[],
    info: {
      event: 'select';
      selected: boolean;
      node: EventDataNode;
      selectedNodes: DataNode[];
      nativeEvent: MouseEvent;
    },
  ) => {
    history.push(`/${info.node.title}`);
    setInitialState((s) => ({ ...s, pathname: history.location.pathname }));
  };

  const query = <Search placeholder="Search" />;

  return (
    <div>
      <Row>
        <Col span={4} />
        <Col span={16}>
          <PageContainer>
            <Divider style={{ margin: '0 0 5px 0' }} />
            <Tabs defaultActiveKey="1" size={'large'} tabBarExtraContent={query}>
              <TabPane tab="Your groups" key="1">
                {groups.map((item: { title: string; key: string; children?: [] }) => {
                  const hasChildren = item.children && item.children.length > 0;
                  return (
                    <div key={item.title}>
                      <DirectoryTree
                        showLine={hasChildren ? { showLeafIcon: false } : false}
                        switcherIcon={<DownOutlined />}
                        treeData={[item]}
                        onSelect={onSelect}
                      />
                      <Divider style={{ margin: '0' }} />
                    </div>
                  );
                })}
              </TabPane>
            </Tabs>
          </PageContainer>
        </Col>
        <Col span={4} />
      </Row>
    </div>
  );
};
