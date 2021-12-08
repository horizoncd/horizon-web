import {Button, Col, Divider, Input, Pagination, Row, Tabs, Tooltip, Tree} from 'antd';
import {history} from 'umi';
import './index.less';
import {useIntl} from '@@/plugin-locale/localeExports';
import {useModel} from "@@/plugin-model/useModel";
import {querySubGroups, searchGroups} from "@/services/groups/groups";
import {searchApplications} from "@/services/applications/applications"
import {searchClusters} from "@/services/clusters/clusters"
import React, {useState} from "react";
import Utils from "@/utils";
import type {DataNode, EventDataNode, Key} from "rc-tree/lib/interface";
import {BookOutlined, CloudOutlined, DownOutlined, FolderOutlined} from "@ant-design/icons";
import '@/components/GroupTree/index.less'
import {useRequest} from "@@/plugin-request/request";
import {ResourceType} from "@/const";
import withTrim from "@/components/WithTrim";

const {DirectoryTree} = Tree;
const Search = withTrim(Input.Search);

const {TabPane} = Tabs;

const groupsURL = '/dashboard/groups'
const applicationsURL = '/dashboard/applications'
const clustersURL = '/dashboard/clusters'

export default (props: any) => {
  const {location} = props;
  const {pathname} = location;

  const groupsDashboard = pathname === groupsURL

  const intl = useIntl();
  const {initialState} = useModel('@@initialState');
  const newGroup = '/groups/new';

  const isAdmin = initialState?.currentUser?.isAdmin || false

  const [searchValue, setSearchValue] = useState('');
  const [total, setTotal] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [query, setQuery] = useState(0);
  const [groups, setGroups] = useState<API.GroupChild[]>([]);
  const defaultExpandedKeys: (string | number)[] = [];
  const [expandedKeys, setExpandedKeys] = useState(defaultExpandedKeys);
  const [applications, setApplications] = useState<API.Application[]>([]);
  const [clusters, setClusters] = useState<CLUSTER.Cluster[]>([]);

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
  }

  // search groups
  const {data: groupsData} = useRequest(() => {
    return searchGroups({
        filter: searchValue,
        pageSize,
        pageNumber
      }
    )
  }, {
    ready: pathname === groupsURL,
    refreshDeps: [query, pageNumber, pageSize],
    onSuccess: () => {
      const {items, total: t} = groupsData!
      setGroups(items);
      setTotal(t)
      updateExpandedKeys(items);
    }
  });

  // search applications
  const {data: applicationsData} = useRequest(() => {
    return searchApplications({
        filter: searchValue,
        pageSize,
        pageNumber
      }
    )
  }, {
    ready: pathname === applicationsURL,
    refreshDeps: [query, pageNumber, pageSize],
    onSuccess: () => {
      const {items, total: t} = applicationsData!
      setTotal(t)
      setApplications(items);
    }
  });

  // search clusters
  const {data: clustersData} = useRequest(() => {
    return searchClusters({
        filter: searchValue,
        pageSize,
        pageNumber
      }
    )
  }, {
    ready: pathname === clustersURL,
    refreshDeps: [query, pageNumber, pageSize],
    onSuccess: () => {
      const {items, total: t} = clustersData!
      setClusters(items);
      setTotal(t)
    }
  });

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
    const {fullPath, updatedAt} = node;

    return <span style={{padding: '10px 0'}} onClick={() => {
      if (groupsDashboard) {
        window.location.href = fullPath
      }
    }}>
      <span className={`avatar-32 identicon bg${Utils.getAvatarColorIndex(title)}`}>
        {firstLetter}
      </span>
      <span style={{marginLeft: 48}}>{tmp}</span>
      <span style={{float: 'right'}}>
        <Tooltip title={Utils.timeToLocal(updatedAt)}>
          更新于 {Utils.timeFromNow(updatedAt)}
        </Tooltip>
      </span>
    </span>;
  };

  const onChange = (e: any) => {
    const {value} = e.target;
    setSearchValue(value);
  };

  const onPressEnter = () => {
    setQuery(prev => prev + 1)
    setPageNumber(1)
  }

  const onSearch = () => {
    setQuery(prev => prev + 1)
    setPageNumber(1)
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

  // select group
  const onSelectGroup = (
    selectedKeys: Key[],
    info: {
      node: any;
    },
  ) => {
    const {node} = info;
    const {key, expanded, fullPath, childrenCount} = node;
    // 如果存在子节点，则展开/折叠该group，不然直接跳转
    if (!childrenCount) {
      // title变为了element对象，需要注意下
      window.location.href = fullPath
    } else if (!expanded) {
      setExpandedKeys([...expandedKeys, key]);
    } else {
      setExpandedKeys(expandedKeys.filter((item) => item !== key));
    }
  };

  // select application
  const onSelectApplication = (
    selectedKeys: Key[],
    info: {
      node: any;
    },
  ) => {
    const {node} = info;
    const {fullPath} = node;
    window.location.href = `/applications${fullPath}/-/clusters`;
  };

  // select cluster
  const onSelectCluster = (
    selectedKeys: Key[],
    info: {
      node: any;
    },
  ) => {
    const {node} = info;
    const {fullPath} = node;
    window.location.href = `/clusters${fullPath}/-/pods`
  };

  // @ts-ignore
  const queryInput = (groupsDashboard && isAdmin) ? <div><Search placeholder="Search" onPressEnter={onPressEnter} onSearch={onSearch} value={searchValue}
            style={{width: '65%', marginRight: '10px'}} onChange={onChange}/>
    <Button
      type="primary"
      onClick={() =>
        history.push({
          pathname: newGroup,
        })
      }
      style={{backgroundColor: '#1f75cb'}}
    >
      {intl.formatMessage({id: 'pages.groups.New group'})}
    </Button>
  </div> : // @ts-ignore
    <Search placeholder="Search" onPressEnter={onPressEnter} onSearch={onSearch} onChange={onChange} value={searchValue}/>;

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
        icon: type === ResourceType.GROUP ? <FolderOutlined/> : <BookOutlined/>,
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
      querySubGroups(pid, 1, pageSize).then(({data}) => {
        const {items} = data;
        setGroups(updateChildren(groups, pid, items))
        setExpandedKeys(expandedKey);
      })
    } else {
      setExpandedKeys(expandedKey);
    }
  };

  const onTabChange = (key: string) => {
    history.replace(key)
  }

  return (
    <Row id="dashboard">
      <Col span={2}/>
      <Col span={20}>
        <Tabs activeKey={pathname} size={'large'} tabBarExtraContent={queryInput} onChange={onTabChange}
              animated={false} style={{marginTop: '15px'}}
        >
          <TabPane tab={'Clusters'} key="/dashboard/clusters">
            {clusters.map((item: CLUSTER.Cluster) => {
              const treeData: DataNode[] = [{
                key: item.id,
                title: item.fullName?.split("/").join("  /  "),
                isLeaf: true,
                icon: <CloudOutlined/>,
                ...item
              }];
              return (
                <div key={item.id}>
                  <DirectoryTree
                    treeData={treeData}
                    titleRender={titleRender}
                    onSelect={onSelectCluster}
                  />
                  <Divider style={{margin: '5px 0 5px 0'}}/>
                </div>
              );
            })}
          </TabPane>
          <TabPane tab={'Applications'} key="/dashboard/applications">
            {applications.map((item: API.Application) => {
              const treeData: DataNode[] = [{
                key: item.id,
                title: item.fullName?.split("/").join("  /  "),
                isLeaf: true,
                icon: <BookOutlined/>,
                ...item
              }];
              return (
                <div key={item.id}>
                  <DirectoryTree
                    treeData={treeData}
                    titleRender={titleRender}
                    onSelect={onSelectApplication}
                  />
                  <Divider style={{margin: '5px 0 5px 0'}}/>
                </div>
              );
            })}
          </TabPane>
          <TabPane tab={'Groups'} key="/dashboard/groups">
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
                    onSelect={onSelectGroup}
                    expandedKeys={expandedKeys}
                  />
                  <Divider style={{margin: '5px 0 5px 0'}}/>
                </div>
              );
            })}
          </TabPane>
        </Tabs>
        <br/>
        <div style={{textAlign: 'center'}}>
          <Pagination current={pageNumber} hideOnSinglePage pageSize={pageSize} total={total}
                      onChange={(page, pSize) => {
                        setPageSize(pSize!)
                        setPageNumber(page)
                      }}/>
        </div>
      </Col>
    </Row>
  );
};
