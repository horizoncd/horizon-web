import React, { useEffect, useState } from 'react';
import { Divider, Input, Tabs, Tree } from 'antd';
import { DownOutlined, FileOutlined } from '@ant-design/icons';
import { history, Link, useModel } from 'umi';
import { DataNode, Key } from 'rc-tree/lib/interface';
import Utils from '@/utils'
import './index.less';
import { queryGroups } from "@/services/groups/groups";

const { DirectoryTree } = Tree;
const { Search } = Input;
const { TabPane } = Tabs;

export default (props: any) => {
  const { parentId } = props;

  const { setInitialState } = useModel('@@initialState');
  const [ searchValue, setSearchValue ] = useState('');
  const [ query, setQuery ] = useState(0);
  const [ groups, setGroups ] = useState<API.GroupChild[]>([]);
  // const [ autoExpandParent, setAutoExpandParent ] = useState(true);
  const defaultExpandedKeys: (string | number)[] = [];
  const [ expandedKeys, setExpandedKeys ] = useState(defaultExpandedKeys);

  useEffect(() => {
    const refresh = async () => {
      const { data } = await queryGroups({
        parentId,
        filter: searchValue,
      });
      setGroups(data);
      updateExpandedKeys();
    }
    refresh();
  }, [ query ]);

  const onExpand = (expandedKey: any) => {
    setExpandedKeys(expandedKey);
  };

  const updateExpandedKeySet = (data: API.GroupChild[], expandedKeySet: Set<string | number>) => {
    for (let i = 0; i < data.length; i += 1) {
      const node = data[i];
      if (searchValue && node.parentId) {
        expandedKeySet.add(node.parentId);
      }
      if (node.children) {
        updateExpandedKeySet(node.children, expandedKeySet);
      }
    }
  };

  const updateExpandedKeys = () => {
    const expandedKeySet = new Set<string | number>();
    updateExpandedKeySet(groups, expandedKeySet);
    setExpandedKeys([ ...expandedKeySet ]);
  }

  const titleRender = (nodeData: any): React.ReactNode => {
    const { title, path } = nodeData;
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
    const firstLetter = title.substring(0, 1).toUpperCase()

    return <span>
      <span className={`avatar-32 identicon bg${Utils.getAvatarColorIndex(title)}`}>
        {firstLetter}
      </span>
      <Link style={{ marginLeft: 48 }} to={`${path}`}>{tmp}</Link>
    </span>;
  };

  // 搜索框输入值监听
  const onChange = (e: any) => {
    const { value } = e.target;
    setSearchValue(value);
  };

  // 搜索框按enter
  const onPressEnter = () => {
    setQuery(prev => prev + 1)
  }

  // 按搜索按钮
  const onSearch = () => {
    setQuery(prev => prev + 1)
  }

  // 选择一行
  const onSelect = (
    selectedKeys: Key[],
    info: {
      node: any;
    },
  ) => {
    const { node } = info;
    const { children, key, expanded, path, type = 'group', id, name } = node;
    setInitialState((s) => ({ ...s, resource: { type, id, path, name }, settings: {} }));
    // 如果存在子节点，则展开/折叠该group，不然直接跳转
    if (!children?.length) {
      // title变为了element对象，需要注意下
      history.push(`${path}`);
    } else if (!expanded) {
      setExpandedKeys([ ...expandedKeys, key ]);
    } else {
      setExpandedKeys(expandedKeys.filter((item) => item !== key));
    }
  };

  const queryInput = <Search placeholder="Search" onPressEnter={onPressEnter} onSearch={onSearch} onChange={onChange}/>;

  const formatTreeData = (items: API.GroupChild[]): DataNode[] =>
    items.map(({ id, name, type, childrenCount, children, ...item }) => ({
      ...item,
      id,
      key: id,
      title: name,
      icon: type === 'application' ? <FileOutlined/> : undefined,
      children: children && formatTreeData(children),
    }));

  return (
    <div>
      <Tabs defaultActiveKey="1" size={'large'} tabBarExtraContent={queryInput}>
        <TabPane tab={props.tabPane} key="1">
          {groups.map((item: API.GroupChild) => {
            const treeData = formatTreeData([ item ]);
            const hasChildren = item.childrenCount > 0;
            return (
              <div key={item.id}>
                <DirectoryTree
                  onExpand={onExpand}
                  showLine={hasChildren ? { showLeafIcon: false } : false}
                  switcherIcon={<DownOutlined/>}
                  treeData={treeData}
                  titleRender={titleRender}
                  onSelect={onSelect}
                  // autoExpandParent={autoExpandParent}
                  expandedKeys={expandedKeys}
                />
                <Divider style={{ margin: '0 0 0 0' }}/>
              </div>
            );
          })}
        </TabPane>
      </Tabs>
    </div>
  );
};
