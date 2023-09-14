import {
  Button, Space, Table, Tabs, Tooltip,
} from 'antd';
import { useState } from 'react';
import { useModel } from '@@/plugin-model/useModel';
import { useRequest } from '@@/plugin-request/request';
import { history, useIntl, Link } from 'umi';
import { listPipelineRuns } from '@/services/clusters/clusters';
import Utils from '@/utils';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import {
  Failed, NotFound, Progressing, Succeeded, Cancelled, Ready, Pending,
} from '@/components/State';
import { DeployTypeMap } from '@/const';
import RBAC from '@/rbac';

const { TabPane } = Tabs;

export default (props: any) => {
  const { location } = props;
  const { query } = location;
  const intl = useIntl();
  // 1. all 2. rollback
  const { category = 'all' } = query;

  const { initialState } = useModel('@@initialState');
  const { id, fullPath } = initialState!.resource;

  const pageSize = 10;
  const [pageNumber, setPageNumber] = useState(1);
  const [tabKey, setTabKey] = useState(category);

  const { data: pipelines } = useRequest(() => listPipelineRuns(id, {
    pageNumber,
    pageSize,
    canRollback: category === 'rollback',
    status: tabKey === 'unmerged' ? ['ready', 'pending'] : undefined,
  }), {
    refreshDeps: [pageNumber, tabKey],
  });

  const onRetry = (pipeline: PIPELINES.Pipeline) => {
    history.push(`/instances${fullPath}/-/pipelines/${pipeline.id}?rollback=true`);
  };

  const formatMessage = (suffix: string, defaultMsg?: string) => intl.formatMessage({ id: `pages.pipeline.${suffix}`, defaultMessage: defaultMsg });

  const columns = [
    {
      title: formatMessage('status'),
      dataIndex: 'status',
      key: 'status',
      render: (text: string, record: PIPELINES.Pipeline) => {
        const link = `/instances${fullPath}/-/pipelines/${record.id}`;
        switch (text) {
          case 'ok':
            return <Succeeded link={link} text={formatMessage('status.passed')} />;
          case 'failed':
            return <Failed link={link} />;
          case 'pending':
            return <Pending link={link} />;
          case 'running':
          case 'created':
            return <Progressing link={link} text={formatMessage('status.running')} />;
          case 'cancelled':
            return <Cancelled link={link} />;
          case 'ready':
            return <Ready link={link} />;
          default:
            return <NotFound link={link} />;
        }
      },
    },
    {
      title: formatMessage('pipeline'),
      dataIndex: 'key',
      key: 'key',
      render: (text: any) => (
        <Space size="middle">
          <Link to={`/instances${fullPath}/-/pipelines/${text}`}>
            #
            {text}
          </Link>
        </Space>
      ),
    },
    {
      title: formatMessage('title'),
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: formatMessage('trigger'),
      dataIndex: 'trigger',
      key: 'trigger',
    },
    {
      title: formatMessage('triggerType'),
      dataIndex: 'action',
      key: 'action',
      render: (text: any) => DeployTypeMap.get(text),
    },
    {
      title: formatMessage('createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: formatMessage('operation'),
      key: 'operations',
      render: (text: string, record: PIPELINES.Pipeline) => (
        record.canRollback && (
          <Space size="middle">
            <Button
              type="link"
              style={{ padding: 0 }}
              disabled={!RBAC.Permissions.rollbackCluster.allowed}
              onClick={() => onRetry(record)}
            >
              <Tooltip title={intl.formatMessage({ id: 'pages.message.cluster.rollback.tooltip' })}>
                {formatMessage('rollback')}
              </Tooltip>
            </Button>
          </Space>
        )
      ),
    },
  ];

  const datasource = pipelines?.items?.map((item) => ({
    ...item,
    key: item.id,
    trigger: item.createdBy.userName,
    createdAt: Utils.timeToLocal(item.createdAt),
  }));

  const table = (
    <Table
      columns={columns}
      dataSource={datasource}
      pagination={{
        position: ['bottomCenter'],
        current: pageNumber,
        hideOnSinglePage: true,
        pageSize,
        total: pipelines?.total,
        onChange: (page) => setPageNumber(page),
      }}
    />
  );

  return (
    <PageWithBreadcrumb>
      <Tabs
        size="large"
        activeKey={tabKey}
        onChange={(key) => {
          history.replace(`/instances${fullPath}/-/pipelines?category=${key}`);
          setTabKey(key);
          setPageNumber(1);
        }}
        animated={false}
      >
        <TabPane tab={formatMessage('all')} key="all">
          {table}
        </TabPane>
        <TabPane tab={formatMessage('canRollback')} key="rollback">
          {table}
        </TabPane>
        <TabPane tab={formatMessage('unmerged')} key="unmerged">
          {table}
        </TabPane>
      </Tabs>
    </PageWithBreadcrumb>
  );
};
