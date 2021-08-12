import React, {useState} from 'react';
import {PageContainer} from '@ant-design/pro-layout';
import {Col, Divider, Input, Row, Tabs, Tree} from 'antd';
import {DownOutlined} from '@ant-design/icons';
import {history, useModel} from 'umi';
import {DataNode, EventDataNode, Key} from 'rc-tree/lib/interface';

const {DirectoryTree} = Tree;
const {Search} = Input;
const {TabPane} = Tabs;

export default (): React.ReactNode => {
  // @ts-ignore
  const {groups, queryGroup} = useModel('groups', (model) => ({
    groups: model.groups,
    queryGroup: model.queryGroup,
  }));
  queryGroup();

  const [searchValue, setSearchValue] = useState('');
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const defaultExpandedKeys: string[] = ['music-pe']
  const [expandedKeys, setExpandedKeys] = useState(defaultExpandedKeys);
  const getParentKey = (key: string, tree: any[]): string => {
    let parentKey;
    for (let i = 0; i < tree.length; i += 1) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some((item: { key: any; }) => item.key === key)) {
          parentKey = node.key;
        } else if (getParentKey(key, node.children)) {
          parentKey = getParentKey(key, node.children);
        }
      }
    }
    return parentKey;
  };

  const onExpand = (expandedKey: any) => {
    setExpandedKeys(expandedKey)
    setAutoExpandParent(false)
  };

  const loop = (data: { title: string; key: string; children?: [] }[]): any =>
    data.map((item: { title: string, key: string, children?: [] }) => {
      const index = item.title.indexOf(searchValue);
      const beforeStr = item.title.substr(0, index);
      const afterStr = item.title.substr(index + searchValue.length);
      const title =
        index > -1 ? (
          <span>
              {beforeStr}
            <span className="site-tree-search-value">{searchValue}</span>
            {afterStr}
            </span>
        ) : (
          <span>{item.title}</span>
        );
      if (item.children) {
        return {title, key: item.key, children: loop(item.children)};
      }

      return {
        title,
        key: item.key,
      };
    });
  const onChange = (e: any) => {
    const {value} = e.target;
    const tmpExpandedKeys = groups
      .map((item: any) => {
        if (item.title.indexOf(value) > -1) {
          return getParentKey(item.key, groups);
        }
        return '';
      })
      .filter((item, i, self) => item && self.indexOf(item) === i);

    setSearchValue(value)
    setExpandedKeys(tmpExpandedKeys)
  }

  const {setInitialState} = useModel('@@initialState');
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
    setInitialState((s) => ({...s, pathname: history.location.pathname}));
  };

  const query = <Search placeholder="Search" onChange={onChange}/>;

  return (
    <div>
      <Row>
        <Col span={4}/>
        <Col span={16}>
          <PageContainer>
            <Divider style={{margin: '0 0 5px 0'}}/>
            <Tabs defaultActiveKey="1" size={'large'} tabBarExtraContent={query}>
              <TabPane tab="Your groups" key="1">
                {groups.map((item: { title: string; key: string; children?: [] }) => {
                  const hasChildren = item.children && item.children.length > 0;
                  return (
                    <div key={item.title}>
                      <DirectoryTree
                        onExpand={onExpand}
                        showLine={hasChildren ? {showLeafIcon: false} : false}
                        switcherIcon={<DownOutlined/>}
                        treeData={loop([item])}
                        onSelect={onSelect}
                        autoExpandParent
                        expandedKeys={expandedKeys}
                      />
                      <Divider style={{margin: '0'}}/>
                    </div>
                  );
                })}
              </TabPane>
            </Tabs>
          </PageContainer>
        </Col>
        <Col span={4}/>
      </Row>
    </div>
  );
};
