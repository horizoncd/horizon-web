import {
  Button, Row, Col, Tabs, Popover,
} from 'antd';
import { useRequest } from '@@/plugin-request/request';
import { history } from '@@/core/history';
import React, { useState } from 'react';
import type { ColumnsType } from 'antd/lib/table';
import { useIntl } from 'umi';
import NoData from '@/components/NoData';
import { getRootTemplates, getTemplatesByUser } from '@/services/templates/templates';
import utils, { handleHref } from '@/utils';
import { getGroupByID } from '@/services/groups/groups';
import {
  DTree, DTreeItem, DTreeItemProp, TreeDataNode,
} from '@/components/DirectoryTree';
import { API } from '@/services/typings';
import { PageWithInitialState } from '@/components/Enhancement';
import { ComponentWithPagination } from '../../components/Enhancement';
import PopupTime from '@/components/Widget/PopupTime';

const { TabPane } = Tabs;

const NameWidth = '25%';

const DTreeWithPagination = ComponentWithPagination(DTree);

const NameLink: React.FC<{ fullpath: string }> = (props) => {
  const { fullpath, children } = props;
  return <a href={`/templates${fullpath}/-/detail`}>{children}</a>;
};

export const TemplateTableColumns: ColumnsType<Templates.Template> = [
  {
    title: 'Name',
    dataIndex: 'name',
    width: NameWidth,
    render: (name: string, t: Templates.Template) => {
      if (!t.fullPath) {
        return null;
      }
      return <NameLink fullpath={t.fullPath}>{name}</NameLink>;
    },
  },
  {
    title: 'Description',
    dataIndex: 'description',
    render: (desc: string) => {
      if (desc.length < 50) {
        return desc;
      }
      return (
        <Popover content={desc}>
          {`${desc.substring(0, 50)}...`}
        </Popover>
      );
    },
  },
  {
    title: 'Updated at',
    dataIndex: 'updatedAt',
    width: '20%',
    render: (updatedAt: string) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const intl = useIntl();
      return (
        <PopupTime
          time={updatedAt}
          prefix={intl.formatMessage({ id: 'pages.common.updated' })}
        />
      );
    },
  },
];

const GroupSource = (props: { groupID: number }) => {
  const { groupID } = props;
  const { data: group } = useRequest(() => getGroupByID(groupID), {});
  const intl = useIntl();
  if (!group) {
    return null;
  }
  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      style={
        {
          fontSize: '10px',
          color: 'grey',
          marginLeft: '10px',
        }
      }
      onClick={
        (e: any) => {
          handleHref(e, group.fullPath);
        }
      }
    >
      {intl.formatMessage({ id: 'pages.template.fromGroup' })}
      {' '}
      <a href={group?.fullPath}>{group?.fullName}</a>
    </div>
  );
};

export const TemplateTableLocale = {
  emptyText: <NoData
    titleID="pages.common.template"
    descID="pages.noData.templates.desc"
  />,
};

interface TemplateTabProps {
  createButton: React.ReactNode
  onSelect?: (key: string) => void
}
export const TemplateTab: React.FC<TemplateTabProps> = (props) => {
  const { onSelect, createButton, children } = props;
  return (
    <Tabs
      defaultActiveKey="1"
      onChange={onSelect}
      size="large"
      tabBarExtraContent={createButton}
      animated={false}
      style={{ marginTop: '15px' }}
    >
      {children}
    </Tabs>
  );
};

TemplateTab.defaultProps = {
  onSelect: () => { },
};

const RootAllTemplateTable = () => {
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  let { data: templates } = useRequest(() => getRootTemplates(true), {
    onSuccess: () => {
      if (!templates) {
        return;
      }
      templates = templates.map((item) => {
        const t = item;
        if (t.fullPath) {
          t.fullName = t.fullPath.substring(1);
          t.fullPath = `/templates${t.fullPath}/-/detail`;
        }
        return t;
      });
      setTotal(templates.length);
    },
  });

  const onPageChange = (pg: number, pz: number) => {
    if (pg) {
      setPage(pg);
    }
    if (pz) {
      setPageSize(pz);
    }
  };

  return (
    <DTreeWithPagination
      // @ts-ignore
      items={templates ? templates.slice((page - 1) * pageSize, page * pageSize) : [] as DTreeItemProp[]}
      onPageChange={onPageChange}
      page={page}
      pageSize={pageSize}
      total={total}
    />
  );
};

const render = (node: TreeDataNode): React.ReactNode => {
  const {
    title, fullPath, updatedAt, group,
  } = node;

  return <DTreeItem title={title} extra={group !== 0 && <GroupSource groupID={group || 0} />} fullPath={fullPath} updatedAt={updatedAt} />;
};

const RootMyTemplateTable = () => {
  const [templates, setTemplates] = useState([] as API.Template[]);
  useRequest(() => getTemplatesByUser(true), {
    onSuccess: (items) => {
      const tpls = items.map((item) => {
        const t = item;
        t.fullName = t.name;
        t.fullPath = `/templates${t.fullPath}/-/detail`;
        return t;
      });
      setTemplates(tpls);
    },
  });
  if (!templates || templates.length === 0) {
    return null;
  }

  //@ts-ignore
  return <DTreeWithPagination items={templates} render={render} />;
};

function TemplateList(props: { initialState: API.InitialState }) {
  const { initialState: { currentUser } } = props;
  const [selectedTab, setSelectedTab] = useState('1');
  const intl = useIntl();
  if (!currentUser) {
    return null;
  }

  const queryInput = (
    <Button
      type="primary"
      style={{ marginBottom: 10, float: 'right', marginRight: 5 }}
      onClick={() => {
        history.push('/templates/new');
      }}
    >
      {intl.formatMessage({ id: 'pages.template.new' })}
    </Button>
  );

  return (
    <Row>
      <Col span={4} />
      <Col span={16}>
        <TemplateTab
          createButton={currentUser.isAdmin && selectedTab === '2' && queryInput}
          onSelect={(key: string) => { setSelectedTab(key); }}
        >
          <TabPane tab={intl.formatMessage({ id: 'pages.dashboard.title.your.templates' })} key="1">
            <RootMyTemplateTable />
          </TabPane>
          <TabPane tab={intl.formatMessage({ id: 'pages.dashboard.title.public.templates' })} key="2">
            <RootAllTemplateTable />
          </TabPane>
        </TemplateTab>
      </Col>
    </Row>
  );
}

export default PageWithInitialState(TemplateList);
