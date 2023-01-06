import React, { useEffect, useState } from 'react';
import {
  Divider, Input, Pagination, Tabs, Tree,
} from 'antd';
import { BookOutlined, DownOutlined, FolderOutlined } from '@ant-design/icons';
import type { DataNode, EventDataNode, Key } from 'rc-tree/lib/interface';
import { useIntl } from 'umi';
import Utils, { handleHref } from '@/utils';
import './index.less';
import {
  queryChildren, querySubGroups, searchChildren, searchGroups,
} from '@/services/groups/groups';
import NoData from '@/components/NoData';
import withTrim from '@/components/WithTrim';
import type { API } from '@/services/typings';

const { DirectoryTree } = Tree;
const Search = withTrim(Input.Search);
const { TabPane } = Tabs;

export default (props: any) => {
  const { groupID, tabPane } = props;
  const intl = useIntl();
  const pageSize = 10;

  const searchFunc = groupID ? searchChildren : searchGroups;
  const queryFunc = groupID ? queryChildren : querySubGroups;

  const [searchValue, setSearchValue] = useState('');
  const [total, setTotal] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [query, setQuery] = useState(0);
  const [groups, setGroups] = useState<API.GroupChild[]>([]);
  const defaultExpandedKeys: (string | number)[] = [];
  const [expandedKeys, setExpandedKeys] = useState(defaultExpandedKeys);

  useEffect(() => {
    const updateExpandedKeySet = (data: API.GroupChild[], expandedKeySet: Set<string | number>) => {
      for (let i = 0; i < data.length; i += 1) {
        const node = data[i];
        if (searchValue) {
          expandedKeySet.add(node.parentID);
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
    };
    const refreshGroups = async () => {
      const { data } = await searchFunc({
        groupID,
        filter: searchValue,
        pageSize,
        pageNumber,
      });
      const { total: t, items } = data;
      setGroups(items);
      setTotal(t);
      updateExpandedKeys(items);
    };
    refreshGroups();
  }, [query, groupID, pageNumber, searchFunc, searchValue]);

  const titleRender = (node: any): React.ReactNode => {
    const { title } = node;
    const index = title.indexOf(searchValue);
    const beforeStr = title.substr(0, index);
    const afterStr = title.substr(index + searchValue.length);
    const tmp = searchValue && index > -1 ? (
      <span className="group-title">
        {beforeStr}
        <span className="site-tree-search-value">{searchValue}</span>
        {afterStr}
      </span>
    ) : (
      <span className="group-title">{title}</span>
    );
    const firstLetter = title.substring(0, 1).toUpperCase();
    const { fullPath, type } = node;

    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <span onClick={(nativeEvent) => {
        let targetPath = fullPath;
        if (type === 'application') {
          targetPath = `${fullPath}`;
        }
        handleHref(nativeEvent, targetPath);
      }}
      >
        <span className={`avatar-32 identicon bg${Utils.getAvatarColorIndex(title)}`}>
          {firstLetter}
        </span>
        <span style={{ marginLeft: 48 }}>{tmp}</span>
      </span>
    );
  };

  const onChange = (e: any) => {
    const { value } = e.target;
    setSearchValue(value);
  };

  const onPressEnter = () => {
    setQuery((prev) => prev + 1);
  };

  const onSearch = () => {
    setQuery((prev) => prev + 1);
  };

  const updateChildren = (items: API.GroupChild[], id: number, children: API.GroupChild[]): API.GroupChild[] => {
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      if (item.id === id) {
        item.children = children;
      }
      if (item.children) {
        updateChildren(item.children, id, children);
      }
    }

    return items;
  };

  const onSelect = (
    selectedKeys: Key[],
    info: {
      node: any;
      nativeEvent: any
    },
  ) => {
    const { node } = info;
    const {
      key, expanded, childrenCount,
    } = node;

    if (childrenCount) {
      if (!expanded) {
        setExpandedKeys([...expandedKeys, key]);
      } else {
        setExpandedKeys(expandedKeys.filter((item) => item !== key));
      }
    }
  };

  // @ts-ignore
  const queryInput = (
    <Search
      placeholder={intl.formatMessage({ id: 'pages.common.search' })}
      onPressEnter={onPressEnter}
      onSearch={onSearch}
      value={searchValue}
      onChange={onChange}
    />
  );

  const formatTreeData = (items: API.GroupChild[]): DataNode[] => items.map(({
    id, name, type, childrenCount, children, ...item
  }) => ({
    ...item,
    id,
    name,
    type,
    key: id,
    title: name,
    childrenCount,
    icon: type === 'group' ? <FolderOutlined /> : <BookOutlined />,
    isLeaf: childrenCount === 0,
    children: children && formatTreeData(children),
  }));

  const onExpand = (expandedKey: any, info: {
    node: EventDataNode;
    expanded: boolean;
    nativeEvent: MouseEvent;
  }) => {
    if (info.expanded && !info.node.children) {
      const pid = info.node.key as number;
      queryFunc(pid, 1, pageSize).then(({ data }) => {
        const { items } = data;
        setGroups(updateChildren(groups, pid, items));
        setExpandedKeys(expandedKey);
      });
    } else {
      setExpandedKeys(expandedKey);
    }
  };

  return (
    <div>
      <Tabs defaultActiveKey="1" size="large" tabBarExtraContent={queryInput}>
        <TabPane tab={tabPane} key="1">
          {groups.length > 0 ? groups.map((item: API.GroupChild) => {
            const treeData = formatTreeData([item]);
            const hasChildren = item.childrenCount > 0;
            return (
              <div key={item.id}>
                <DirectoryTree
                  onExpand={onExpand}
                  showLine={hasChildren ? { showLeafIcon: false } : false}
                  switcherIcon={<DownOutlined />}
                  treeData={treeData}
                  titleRender={titleRender}
                  onSelect={onSelect}
                  expandedKeys={expandedKeys}
                />
                <Divider style={{ margin: '0 0 0 0' }} />
              </div>
            );
          }) : (
            <NoData
              titleID="pages.noData.groups.title"
              descID="pages.noData.groups.desc"
            />
          )}
        </TabPane>
      </Tabs>
      <br />
      <div style={{ textAlign: 'center' }}>
        <Pagination
          current={pageNumber}
          hideOnSinglePage
          pageSize={pageSize}
          total={total}
          onChange={(page) => setPageNumber(page)}
        />
      </div>
    </div>
  );
};
