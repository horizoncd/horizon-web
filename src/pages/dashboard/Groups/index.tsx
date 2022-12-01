/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import {
  Button, Divider, Input, Pagination, Tabs, Tooltip, Tree,
} from 'antd';
import { history, Location } from 'umi';
import '../index.less';
import { useIntl } from '@@/plugin-locale/localeExports';
import React, { useMemo, useState } from 'react';
import type { DataNode, EventDataNode, Key } from 'rc-tree/lib/interface';
import { BookOutlined, DownOutlined, FolderOutlined } from '@ant-design/icons';
import { useRequest } from '@@/plugin-request/request';
import { querySubGroups, searchGroups } from '@/services/groups/groups';
import Utils, { handleHref } from '@/utils';
import '@/components/GroupTree/index.less';
import { ResourceType } from '@/const';
import withTrim from '@/components/WithTrim';
import type { API } from '@/services/typings';
import { PageWithInitialState, PageWithInitialStateProps } from '@/components/Enhancement';
import WithContainer from '../components/WithContainer';
import { setQuery as setQueryUtil } from '../utils';
import { PopupTime } from '@/components/Widget';

const Search = withTrim(Input.Search);
const { TabPane } = Tabs;
const { DirectoryTree } = Tree;

const QueryName = 'name';

interface GroupProps
  extends PageWithInitialStateProps {
  location: Location
}

function Groups(props: GroupProps) {
  const { initialState, location } = props;
  const { [QueryName]: qName = '' } = location.query ?? {};

  const intl = useIntl();
  const newGroup = '/groups/new';

  const isAdmin = initialState.currentUser?.isAdmin || false;

  const [filter, setFilter] = useState(qName as string);
  const [total, setTotal] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [query, setQuery] = useState(0);
  const [groups, setGroups] = useState<API.GroupChild[]>([]);
  const defaultExpandedKeys: (string | number)[] = [];
  const [expandedKeys, setExpandedKeys] = useState(defaultExpandedKeys);

  const updateExpandedKeySet = (data: API.GroupChild[], expandedKeySet: Set<string | number>) => {
    for (let i = 0; i < data.length; i += 1) {
      const node = data[i];
      if (filter) {
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

  // search groups
  const { data: groupsData } = useRequest(() => searchGroups({
    filter,
    pageSize,
    pageNumber,
  }), {
    refreshDeps: [query, filter, pageNumber, pageSize],
    debounceInterval: 200,
    onSuccess: () => {
      const { items, total: t } = groupsData!;
      setGroups(items);
      setTotal(t);
      updateExpandedKeys(items);
      setQueryUtil({
        [QueryName]: filter,
      });
    },
  });

  const titleRender = (node: any): React.ReactNode => {
    const { title } = node;
    const index = title.indexOf(filter);
    const beforeStr = title.substr(0, index);
    const afterStr = title.substr(index + filter.length);
    const tmp = filter && index > -1 ? (
      <span className="group-title">
        {beforeStr}
        <span className="site-tree-search-value">{filter}</span>
        {afterStr}
      </span>
    ) : (
      <span className="group-title">{title}</span>
    );
    const firstLetter = title.substring(0, 1).toUpperCase();
    const { fullPath, updatedAt } = node;

    return (
      <span
        style={{ padding: '10px 0', lineHeight: '48px' }}
        onClick={(nativeEvent) => {
          // group点击名字进入主页 点击其他部位是展开
          handleHref(nativeEvent, fullPath);
        }}
      >
        <span className={`avatar-48 identicon bg${Utils.getAvatarColorIndex(title)}`}>
          {firstLetter}
        </span>
        <span style={{ marginLeft: 60 }}>{tmp}</span>
        <span style={{ float: 'right', fontSize: 14, color: '#666666' }}>
          <Tooltip title={Utils.timeToLocal(updatedAt)}>
            <PopupTime
              time={Utils.timeToLocal(updatedAt)}
              prefix={intl.formatMessage({ id: 'pages.common.updated' })}
            />
          </Tooltip>
        </span>
      </span>
    );
  };

  const onChange = (e: any) => {
    const { value } = e.target;
    setFilter(value);
  };

  const onPressEnter = () => {
    setQuery((prev) => prev + 1);
    setPageNumber(1);
  };

  const onSearch = () => {
    setQuery((prev) => prev + 1);
    setPageNumber(1);
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

  // select group
  const onSelectGroup = (
    selectedKeys: Key[],
    info: {
      node: any;
    },
  ) => {
    const { node } = info;
    const {
      key, expanded, childrenCount,
    } = node;
    // 如果存在子节点，则展开/折叠该group，不然直接跳转
    if (childrenCount) {
      // title变为了element对象，需要注意下
      if (!expanded) {
        setExpandedKeys([...expandedKeys, key]);
      } else {
        setExpandedKeys(expandedKeys.filter((item) => item !== key));
      }
    }
  };

  const groupQueryInput = useMemo(() => (
    isAdmin && (
      <div>
        <Search
          placeholder={intl.formatMessage({ id: 'pages.common.search' })}
          onPressEnter={onPressEnter}
          onSearch={onSearch}
          value={filter}
          style={{ width: '65%', marginRight: '10px' }}
          onChange={onChange}
        />
        <Button
          type="primary"
          onClick={() => history.push({
            pathname: newGroup,
          })}
          style={{ backgroundColor: '#1f75cb' }}
        >
          {intl.formatMessage({ id: 'pages.groups.New group' })}
        </Button>
      </div>
    )), [filter, intl, isAdmin]);

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
    icon: type === ResourceType.GROUP ? <FolderOutlined /> : <BookOutlined />,
    isLeaf: childrenCount === 0,
    children: children && formatTreeData(children),
  }));

  const onExpand = (expandedKey: any, info: {
    node: EventDataNode;
    expanded: boolean;
    nativeEvent: MouseEvent;
  }) => {
    // 如果是展开并且node下的children为空，则进行查询
    if (info.expanded && !info.node.children) {
      const pid = info.node.key as number;
      querySubGroups(pid, 1, pageSize).then(({ data }) => {
        const { items } = data;
        setGroups(updateChildren(groups, pid, items));
        setExpandedKeys(expandedKey);
      });
    } else {
      setExpandedKeys(expandedKey);
    }
  };

  return (
    <>
      <Tabs
        size="large"
        tabBarExtraContent={groupQueryInput}
        animated={false}
        style={{ marginTop: '15px' }}
      >
        <TabPane tab={intl.formatMessage({ id: 'pages.dashboard.title.all.groups' })} key="/explore/groups">
          {groups.map((item: API.GroupChild) => {
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
                  onSelect={onSelectGroup}
                  expandedKeys={expandedKeys}
                />
                <Divider style={{ margin: '5px 0 5px 0' }} />
              </div>
            );
          })}
        </TabPane>
      </Tabs>
      <br />
      <div style={{ textAlign: 'center' }}>
        <Pagination
          current={pageNumber}
          hideOnSinglePage
          pageSize={pageSize}
          total={total}
          onChange={(page, pSize) => {
            setPageSize(pSize!);
            setPageNumber(page);
          }}
        />
      </div>
    </>
  );
}

export default WithContainer(PageWithInitialState(Groups));
