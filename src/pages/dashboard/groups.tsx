import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Col, Divider, Input, Row, Tree } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { queryGroups } from '@/services/dashboard/groups';
import { Link } from 'umi';

const { DirectoryTree } = Tree;
const { Search } = Input;

const queryData = async () => {
  const { data } = await queryGroups();
  console.log(data);
  return data;
};

class Groups extends React.Component {
  state = {
    treeData: [],
  };

  titleRender = (nodeData: any): React.ReactNode => {
    const { title } = nodeData;
    return (
      <Link to={`/${title}`} style={{ color: 'black' }} onClick={(item) => console.log(item)}>
        {title}
      </Link>
    );
  };

  componentDidMount() {
    queryData().then((data) => {
      this.setState({
        treeData: data,
      });
    });
  }

  render() {
    console.log('lll');
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
                treeData={this.state.treeData}
                titleRender={this.titleRender}
              />
            </PageContainer>
          </Col>

          <Col span={4} />
        </Row>
      </div>
    );
  }
}

export default Groups;
