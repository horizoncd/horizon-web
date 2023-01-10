import { Button, Space, Table } from 'antd';
import { useRequest } from '@@/plugin-request/request';
import { useState } from 'react';
import { history } from '@@/core/history';
import { Link, useIntl } from 'umi';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import NoData from '@/components/NoData';
import { queryEnvironments } from '@/services/environments/environments';
import {
  queryEnvironmentRegions,
} from '@/services/environmentregions/environmentregions';
import dashboardStyles from '../../dashboard/index.less';
import Utils from '@/utils';

export default () => {
  const intl = useIntl();
  const [envToRegions, setEnvToRegions] = useState<Map<string, SYSTEM.EnvironmentRegion[]>>(new Map());

  const formatMessage = (suffix: string) => intl.formatMessage({ id: `pages.environment.${suffix}` });

  const columns = [
    {
      title: formatMessage('name'),
      dataIndex: 'name',
      render: (name: number, r: SYSTEM.Environment) => (
        <Space size="middle">
          <Link to={`/admin/environments/${r.id}`}>{name}</Link>
        </Space>
      ),
    },
    {
      title: formatMessage('displayName'),
      dataIndex: 'displayName',
    },
    {
      title: 'Kubernetes',
      dataIndex: 'regionTexts',
      render: (text: any) => text,
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

  const { data: environments = [] } = useRequest(() => queryEnvironments());
  const { data: environmentRegions = [] } = useRequest(() => queryEnvironmentRegions(''), {
    onSuccess: () => {
      const m = new Map<string, SYSTEM.EnvironmentRegion[]>();
      for (let i = 0; i < environmentRegions.length; i += 1) {
        const env = environmentRegions[i].environmentName;
        const v = m.get(env);
        if (!v) {
          m.set(env, [environmentRegions[i]]);
        } else {
          v.push(environmentRegions[i]);
        }
      }
      setEnvToRegions(m);
    },
    ready: environments.length > 0,
  });

  const queryInput = (
    <Button
      type="primary"
      style={{ marginBottom: 10, float: 'right', marginRight: 5 }}
      onClick={() => {
        history.push('/admin/environments/new');
      }}
    >
      {formatMessage('new')}
    </Button>
  );

  const dataSource = environments.map((item) => {
    const r = envToRegions.get(item.name);
    if (r) {
      const regionTexts = r.map((region, index) => (
        <span key={region.regionName}>
          {region.regionDisplayName}
          {
            region.isDefault && (
            <span className={dashboardStyles.userAccessRole}>
              {formatMessage('k8s.default')}
            </span>
            )
          }
          {
            region.disabled && (
            <span className={dashboardStyles.userAccessRole}>
              {formatMessage('k8s.status.off')}
            </span>
            )
          }
          {
            index < r.length - 1 && <br />
          }
        </span>
      ));
      return {
        ...item,
        regionTexts,
      };
    }
    return {
      ...item,
    };
  });

  const locale = {
    emptyText: <NoData
      titleID="pages.common.env"
      descID="pages.noData.env.desc"
    />,
  };
  const table = (
    <Table
      columns={columns}
      rowKey="name"
      dataSource={dataSource}
      locale={locale}
      pagination={{
        position: ['bottomCenter'],
        hideOnSinglePage: true,
        total: dataSource?.length,
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
