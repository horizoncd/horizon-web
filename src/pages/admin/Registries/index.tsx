import { Button, Space, Table } from 'antd';
import { useRequest } from '@@/plugin-request/request';
import { history, Link, useIntl } from 'umi';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import NoData from '@/components/NoData';
import { queryRegistries } from '@/services/registries/registries';
import Utils from '@/utils';

export default () => {
  const { data: registries } = useRequest(() => queryRegistries(), {});
  const intl = useIntl();

  const formatMessage = (suffix: string) => intl.formatMessage({ id: `pages.registry.${suffix}` });

  const columns = [
    {
      title: formatMessage('name'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, r: SYSTEM.Registry) => (
        <Space size="middle">
          <Link to={`/admin/registries/${r.id}`}>{name}</Link>
        </Space>
      ),
    },
    {
      title: 'Server',
      dataIndex: 'server',
      key: 'server',
    },
    {
      title: formatMessage('type'),
      dataIndex: 'kind',
      key: 'kind',
    },
    {
      title: formatMessage('createdAt'),
      dataIndex: 'createdAt',
      render: (v: string) => Utils.timeToLocal(v),
    },
    {
      title: formatMessage('updatedAt'),
      dataIndex: 'updatedAt',
      render: (v: string) => Utils.timeToLocal(v),
    },
  ];

  const queryInput = (
    <Button
      type="primary"
      style={{ marginBottom: 10, float: 'right', marginRight: 5 }}
      onClick={() => {
        history.push('/admin/registries/new');
      }}
    >
      {formatMessage('new')}
    </Button>
  );

  const locale = {
    emptyText: <NoData
      titleID="pages.noData.registry.title"
      descID="pages.noData.registry.desc"
    />,
  };

  const table = (
    <Table
      columns={columns}
      dataSource={registries}
      locale={locale}
      pagination={{
        position: ['bottomCenter'],
        hideOnSinglePage: true,
        total: registries?.length,
        pageSize: 7,
      }}
    />
  );

  return (
    <PageWithBreadcrumb>
      {queryInput}
      {table}
    </PageWithBreadcrumb>
  );
};
