import React, { useState } from 'react';
import { Divider, Input, Tabs, Tree } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { history, useModel, Link } from 'umi';
import { DataNode, EventDataNode, Key } from 'rc-tree/lib/interface';
import './index.less';

const { DirectoryTree } = Tree;
const { Search } = Input;
const { TabPane } = Tabs;

export default (props: any) => {
  // @ts-ignore
  const { groups, queryGroup } = useModel('groups', (model) => ({
    groups: model.groups,
    queryGroup: model.queryGroup,
  }));
  queryGroup();

  const [searchValue, setSearchValue] = useState('');
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const defaultExpandedKeys: (string | number)[] = [];
  const [expandedKeys, setExpandedKeys] = useState(defaultExpandedKeys);

  const getParentKey = (key: string, tree: any[]): string => {
    let parentKey;
    for (let i = 0; i < tree.length; i += 1) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some((item: { key: any }) => item.key === key)) {
          parentKey = node.key;
        } else if (getParentKey(key, node.children)) {
          parentKey = getParentKey(key, node.children);
        }
      }
    }
    return parentKey;
  };

  const dataList: { key: string; title: string }[] = [];
  const generateList = (data: API.Group[]) => {
    for (let i = 0; i < data.length; i += 1) {
      const node = data[i];
      const { key } = node;
      dataList.push({ key, title: key });
      if (node.children) {
        generateList(node.children);
      }
    }
  };
  generateList(groups);

  const onExpand = (expandedKey: any) => {
    setExpandedKeys(expandedKey);
    setAutoExpandParent(false);
  };

  const getTotalPath = (title: any): string => {
    const parentKey: string = getParentKey(title, groups);
    return parentKey ? `${getTotalPath(parentKey)}/${title}` : title;
  };

  const titleRender = (nodeData: any): React.ReactNode => {
    const { title } = nodeData;
    const index = title.indexOf(searchValue);
    const beforeStr = title.substr(0, index);
    const afterStr = title.substr(index + searchValue.length);
    const tmp =
      searchValue && index > -1 ? (
        <span className="group-title">
          {beforeStr}
          <span className="site-tree-search-value">{searchValue}</span>
          {afterStr}
        </span>
      ) : (
        <span className="group-title">{title}</span>
      );
    console.log(getTotalPath(title))
    return <Link to={`/${getTotalPath(title)}`}>{tmp}</Link>;
  };

  // 搜索框输入值监听
  const onChange = (e: any) => {
    const { value } = e.target;
    const tmpExpandedKeys = dataList
      .map((item: any) => {
        if (value && item.title.indexOf(value) > -1) {
          return getParentKey(item.key, groups);
        }
        return '';
      })
      .filter((item, i, self) => item && self.indexOf(item) === i);

    setSearchValue(value);
    setExpandedKeys(tmpExpandedKeys);
  };

  const { setInitialState } = useModel('@@initialState');

  // 选择一行
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
    const { node } = info;
    setInitialState((s) => ({ ...s, pathname: history.location.pathname }));
    // 如果存在子节点，则展开/折叠该group，不然直接跳转
    const { children, key, expanded } = node;
    if (!children?.length) {
      // title变为了element对象，需要注意下
      history.push(`/${getTotalPath(info.node.title)}`);
    } else if (!expanded) {
      setExpandedKeys([...expandedKeys, key]);
    } else {
      setExpandedKeys(expandedKeys.filter((item) => item !== key));
    }
  };

  const query = <Search placeholder="Search" onChange={onChange} />;

  return (
    <div>
      <Tabs defaultActiveKey="1" size={'large'} tabBarExtraContent={query}>
        <TabPane tab={props.tabPane} key="1">
          {groups.map((item: API.Group) => {
            const hasChildren = item.children && item.children.length > 0;
            return (
              <div key={item.title}>
                <DirectoryTree
                  onExpand={onExpand}
                  showLine={hasChildren ? { showLeafIcon: false } : false}
                  switcherIcon={<DownOutlined />}
                  treeData={[item]}
                  titleRender={titleRender}
                  onSelect={onSelect}
                  autoExpandParent={autoExpandParent}
                  expandedKeys={expandedKeys}
                />
                <Divider style={{ margin: '0' }} />
              </div>
            );
          })}
        </TabPane>
      </Tabs>
    </div>
  );
};
