import React, {useEffect, useState} from 'react';
import {Divider, Input, Pagination, Tabs, Tree} from 'antd';
import {DownOutlined, FileOutlined, FolderOutlined} from '@ant-design/icons';
import {history, Link, useModel} from 'umi';
import {DataNode, EventDataNode, Key} from 'rc-tree/lib/interface';
import Utils from '@/utils'
import './index.less';
import {queryGroups, querySubGroups} from "@/services/groups/groups";

const {DirectoryTree} = Tree;
const {Search} = Input;
const {TabPane} = Tabs;

export default (props: any) => {
  const {parentId} = props;
  const {setInitialState} = useModel('@@initialState');
  const [searchValue, setSearchValue] = useState('');
  const [total, setTotal] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [query, setQuery] = useState(0);
  const [groups, setGroups] = useState<API.GroupChild[]>([]);
  // const [ autoExpandParent, setAutoExpandParent ] = useState(true);
  const defaultExpandedKeys: (string | number)[] = [];
  const [expandedKeys, setExpandedKeys] = useState(defaultExpandedKeys);

  const updateExpandedKeySet = (data: API.GroupChild[], expandedKeySet: Set<string | number>) => {
    for (let i = 0; i < data.length; i += 1) {
      const node = data[i];
      if (searchValue) {
        expandedKeySet.add(node.parentId);
      }
      if (node.children) {
        updateExpandedKeySet(node.children, expandedKeySet);
      }
    }
  };

  const updateExpandedKeys = (newGroups: API.GroupChild[]) => {
    const expandedKeySet = new Set<string | number>();
    updateExpandedKeySet(newGroups, expandedKeySet);
    setExpandedKeys([...expandedKeySet]);
  }

  useEffect(() => {
    const refresh = async () => {
      const {data} = await queryGroups({
        parentId,
        filter: searchValue,
        pageSize,
        pageNumber
      });
      const {total: t, items} = data;
      setGroups(items);
      setTotal(t)
      updateExpandedKeys(items);
    }
    refresh();
  }, [query, parentId, pageNumber]);

  const titleRender = (node: any): React.ReactNode => {
    const {title} = node;
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
    const {fullPath} = node;

    return <span  onClick={() => {history.push(`${fullPath}`);}}>
      <span className={`avatar-32 identicon bg${Utils.getAvatarColorIndex(title)}`}>
        {firstLetter}
      </span>
      <span style={{marginLeft: 48}}>{tmp}</span>
    </span>;
  };

  // 搜索框输入值监听
  const onChange = (e: any) => {
    const {value} = e.target;
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

  const updateChildren = (items: API.GroupChild[], id: number, children: API.GroupChild[]): API.GroupChild[] => {
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      if (item.id === id) {
        item.children = children
      }
      if (item.children) {
        updateChildren(item.children, id, children)
      }
    }

    return items
  }

  // 选择一行
  const onSelect = (
    selectedKeys: Key[],
    info: {
      node: any;
    },
  ) => {
    const {node} = info;
    console.log(node)
    const {key, expanded, fullPath, type, id, name, fullName, childrenCount} = node;
    // 如果存在子节点，则展开/折叠该group，不然直接跳转
    setInitialState((s) => ({...s, resource: {type, id, fullPath, name, fullName}, settings: {}}));
    if (!childrenCount) {
      // title变为了element对象，需要注意下
      history.push(`${fullPath}`);
    } else if (!expanded) {
      setExpandedKeys([...expandedKeys, key]);
    } else {
      setExpandedKeys(expandedKeys.filter((item) => item !== key));
    }
  };

  const queryInput = <Search placeholder="Search" onPressEnter={onPressEnter} onSearch={onSearch} onChange={onChange}/>;

  const formatTreeData = (items: API.GroupChild[]): DataNode[] => {
    return items.map(({id, name, type, childrenCount, children, ...item}) => {
      return {
        ...item,
        id,
        name,
        type,
        key: id,
        title: name,
        childrenCount,
        icon: type === 'group' ? <FolderOutlined/> : <FileOutlined/>,
        isLeaf: childrenCount === 0,
        children: children && formatTreeData(children),
      }
    });
  }

  const onExpand = (expandedKey: any, info: {
    node: EventDataNode;
    expanded: boolean;
    nativeEvent: MouseEvent;
  }) => {
    // 如果是展开并且node下的children为空，则进行查询
    if (info.expanded && !info.node.children) {
      const pid = info.node.key as number;
      querySubGroups(pid).then(({data}) => {
        const {items} = data;
        setGroups(updateChildren(groups, pid, items))
        setExpandedKeys(expandedKey);
      })
    } else {
      setExpandedKeys(expandedKey);
    }
  };

  return (
    <div>
      <Tabs defaultActiveKey="1" size={'large'} tabBarExtraContent={queryInput}>
        <TabPane tab={props.tabPane} key="1">
          {groups.map((item: API.GroupChild) => {
            const treeData = formatTreeData([item]);
            const hasChildren = item.childrenCount > 0;
            return (
              <div key={item.id}>
                <DirectoryTree
                  onExpand={onExpand}
                  showLine={hasChildren ? {showLeafIcon: false} : false}
                  switcherIcon={<DownOutlined/>}
                  treeData={treeData}
                  titleRender={titleRender}
                  onSelect={onSelect}
                  // autoExpandParent={autoExpandParent}
                  expandedKeys={expandedKeys}
                />
                <Divider style={{margin: '0 0 0 0'}}/>
              </div>
            );
          })}
        </TabPane>
      </Tabs>
      <br/>
      <div style={{textAlign: 'center'}}>
        <Pagination current={pageNumber} hideOnSinglePage pageSize={pageSize} total={total}
                    onChange={(page) => setPageNumber(page)}/>
      </div>
    </div>
  );
};
