import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Col, Divider, Input, Row, Tabs, Tree } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { history, Link, useModel } from 'umi';

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
  const onSelect = (item) => {
    console.log(item);
    setInitialState((s) => ({ ...s, pathname: history.location.pathname }));
  };

  const titleRender = (nodeData: any): React.ReactNode => {
    const { title } = nodeData;
    return (
      <Link to={`/${title}`} style={{ color: 'black' }}>
        {title}
      </Link>
    );
  };

  return (
    <div>
      <Row>
        <Col span={4} />
        <Col span={16}>
          <PageContainer>
            <Divider />
            <Search style={{ marginBottom: 15 }} placeholder="Search" />
            <Tabs defaultActiveKey="1">
              <TabPane tab="Your groups" key="1">
                {groups.map((item: { title: string; key: string; children?: [] }) => {
                  const hasChildren = item.children && item.children.length > 0;
                  return (
                    <div key={item.title}>
                      <DirectoryTree
                        showLine={hasChildren ? { showLeafIcon: false } : false}
                        switcherIcon={<DownOutlined />}
                        treeData={[item]}
                        titleRender={titleRender}
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
