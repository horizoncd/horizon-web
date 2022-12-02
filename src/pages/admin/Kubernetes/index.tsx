import { Button, Space, Table } from 'antd';
import { useRequest } from '@@/plugin-request/request';
import { history } from '@@/core/history';
import styled from 'styled-components';
import { Link, useIntl } from 'umi';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import NoData from '@/components/NoData';
import { queryRegions } from '@/services/regions/regions';
import CollapseList from '@/components/CollapseList';
import Utils from '@/utils';
import { API } from '@/services/typings';

const QueryInput = styled(Button)`
  float: right;
  margin-bottom: 10px;
  margin-right: 5px;
`;

export default () => {
  const intl = useIntl();
  const { data: regions } = useRequest(() => queryRegions(), {});

  const formatMessage = (suffix: string) => intl.formatMessage({ id: `pages.kubernetes.${suffix}` });

  const columns = [
    {
      title: formatMessage('name'),
      dataIndex: 'displayName',
      render: (name: string, r: SYSTEM.Region) => (
        <Space size="middle">
          <Link to={`/admin/kubernetes/${r.id}`}>{name}</Link>
        </Space>
      ),
    },
    {
      title: formatMessage('domain'),
      dataIndex: 'server',
    },
    {
      title: intl.formatMessage({ id: 'pages.common.tags' }),
      width: '250px',
      dataIndex: 'tags',
      render: (tags: [API.Tag]) => {
        if (tags) {
          const data = {};
          for (let i = 0; i < tags.length; i += 1) {
            data[tags[i].key] = tags[i].value;
          }
          return <CollapseList defaultCount={2} data={data} />;
        }
        return '';
      },
    },
    {
      title: formatMessage('status'),
      width: '100px',
      dataIndex: 'disabled',
      render: (disabled: boolean) => (disabled ? <span style={{ color: 'red' }}>{formatMessage('status.off')}</span> : formatMessage('status.on')),
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

  const locale = {
    emptyText: <NoData
      titleID="pages.common.region"
      descID="pages.noData.region.desc"
    />,
  };

  const table = (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={regions}
      locale={locale}
      pagination={{
        position: ['bottomCenter'],
        hideOnSinglePage: true,
        total: regions?.length,
        pageSize: 7,
      }}
    />
  );

  return (
    <PageWithBreadcrumb>
      <QueryInput
        type="primary"
        onClick={() => {
          history.push('/admin/kubernetes/new');
        }}
      >
        {formatMessage('new')}
      </QueryInput>
      {table}
    </PageWithBreadcrumb>
  );
};
