import React from 'react';
import {PageContainer} from '@ant-design/pro-layout';
import {Col, Divider, Input, Row, Tree} from 'antd';
import {DownOutlined} from '@ant-design/icons';
import {history, Link, useModel} from 'umi';

const {DirectoryTree} = Tree;
const {Search} = Input;

export default (): React.ReactNode => {
  // @ts-ignore
  const {groups, queryGroup} = useModel('groups', (model) => ({
    groups: model.groups,
    queryGroup: model.queryGroup,
  }));
  queryGroup();

  const {setInitialState} = useModel('@@initialState');
  const onSelect = (item) => {
    console.log(item)
    setInitialState((s) => ({...s, pathname: history.location.pathname}));
  };

  const titleRender = (nodeData: any): React.ReactNode => {
    const {title} = nodeData;
    // console.log(nodeData)
    return (
      <Link to={`/${title}`} style={{color: 'black', lineHeight: '40px'}}>
        {title}
      </Link>
    );
  };

  return (
    <div>
      <Row>
        <Col span={4}/>
        <Col span={16}>
          <PageContainer>
            <Divider/>
            <Search style={{marginBottom: 15}} placeholder="Search"/>
            {
              groups.map((item: { title: string, key: string, children?: [] }) => {
                  const tmp = (
                    <div key={item.title}>
                      <DirectoryTree
                        showLine={{showLeafIcon: false}}
                        switcherIcon={<DownOutlined/>}
                        treeData={[item]}
                        titleRender={titleRender}
                        onSelect={onSelect}
                      />
                      <Divider style={{margin: 0}}/>
                    </div>
                  )
                  console.log(tmp)
                  return tmp
                }
              )
            }
          </PageContainer>
        </Col>

        <Col span={4}/>
      </Row>
    </div>
  );
};
