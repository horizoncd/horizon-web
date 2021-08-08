import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import {Col, Divider, Input, Row, Tree} from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { Link, useModel } from 'umi';
import { history } from '@@/core/history';

const { DirectoryTree } = Tree;
const { Search } = Input;

export default (): React.ReactNode => {
  // @ts-ignore
  const { groups, queryGroup } = useModel('groups', model => ({ groups: model.groups, queryGroup: model.queryGroup }));
  queryGroup();

  const { setInitialState } = useModel('@@initialState');
  const onSelect = () => {
    setInitialState((s) => ({ ...s, location: history.location }));

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
            <Search style={{ marginBottom: 8 }} placeholder="Search" />

            <DirectoryTree
              showLine
              switcherIcon={<DownOutlined />}
              treeData={groups}
              titleRender={titleRender}
              onSelect={onSelect}
            />
          </PageContainer>
        </Col>

        <Col span={4} />
      </Row>
    </div>
  );
};
