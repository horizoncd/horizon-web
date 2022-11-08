import { Button, Space, Table } from 'antd';
import { useRequest } from '@@/plugin-request/request';
import { history, Link } from 'umi';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import NoData from '@/components/NoData';
import { queryRegistries } from '@/services/registries/registries';
import Utils from '@/utils';

export default () => {
  const { data: registries } = useRequest(() => queryRegistries(), {});

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, r: SYSTEM.Registry) => (
        <Space size="middle">
          <Link to={`/admin/registries/${r.id}`}>{name}</Link>
        </Space>
      ),
    },
    {
      title: '域名',
      dataIndex: 'server',
      key: 'server',
    },
    {
      title: 'kind',
      dataIndex: 'kind',
      key: 'kind',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      render: (v: string) => Utils.timeToLocal(v),
    },
    {
      title: '更新时间',
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
      创建Registry
    </Button>
  );

  const locale = {
    emptyText: <NoData
      title="Registry"
      desc="registry是一个镜像中心服务，负责存储和分发容器镜像"
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
