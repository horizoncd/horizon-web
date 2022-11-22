import {
  Space, Button, Table, Modal,
} from 'antd';
import { useRequest } from '@@/plugin-request/request';
import { history } from '@@/core/history';
import { FireOutlined } from '@ant-design/icons';
import { useIntl, useModel } from 'umi';
import NoData from '@/components/NoData';
import {
  deleteRelease, queryReleases, StatusCode, syncReleaseToRepo,
} from '@/services/templates/templates';
import { NotFound } from '@/components/State';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import RBAC from '@/rbac';
import SyncStatus from './Components/SyncStatus';

export const ReleasesTable = (props: { fullName: string, releases: Templates.Release[], refresh: () => void }) => {
  const { releases, fullName, refresh } = props;
  const { successAlert } = useModel('alert');
  const intl = useIntl();

  const formatMessage = (suffix: string) => intl.formatMessage({ id: `pages.template.${suffix}` });

  const columns = [
    {
      title: formatMessage('release'),
      dataIndex: 'name',
      render: (name: string, t: Templates.Release) => (
        <Space size="middle">
          <a href={`/templates/${fullName}/-/releases/${t.name}`}>{name}</a>
        </Space>
      ),
    },
    {
      title: formatMessage('recommended'),
      render: (recommended: boolean) => (recommended && <FireOutlined style={{ color: '#FF4500' }} />),
      dataIndex: 'recommended',
    },
    {
      title: 'Commit ID',
      dataIndex: 'commitID',
    },
    {
      title: formatMessage('release.syncStatus'),
      dataIndex: 'syncStatusCode',
      render: (syncStatus: StatusCode) => <SyncStatus statusCode={syncStatus} />,
    },
    {
      title: formatMessage('release.lastSyncAt'),
      dataIndex: 'lastSyncAt',
      render: (syncTime: string) => new Date(syncTime).toLocaleString(),
    },
    {
      title: formatMessage('release.operation'),
      dataIndex: 'name',
      render: (name: string, r: Templates.Release) => (
        <Space size="middle">
          <Button
            type="primary"
            disabled={r.syncStatus === 'Succeed'
          || !RBAC.Permissions.syncRelease.allowed}
            onClick={() => {
              syncReleaseToRepo(r.id).then(() => {
                successAlert(intl.formatMessage({ id: 'pages.message.release.sync.success' }));
              }).then(refresh);
            }}
          >
            {formatMessage('release.sync')}
          </Button>

          <Button
            type="primary"
            disabled={!RBAC.Permissions.updateRelease.allowed}
            onClick={() => { window.location.href = `/templates/${fullName}/-/releases/${r.name}/edit`; }}
          >
            {intl.formatMessage({ id: 'pages.common.edit' })}
          </Button>
          <Button
            type="primary"
            disabled={!RBAC.Permissions.deleteRelease.allowed}
            danger
            onClick={() => {
              Modal.confirm({
                title: intl.formatMessage({ id: 'pages.message.release.delete.confirm' }, { release: r.name }),
                content: intl.formatMessage({ id: 'pages.message.release.delete.content' }),
                onOk: () => {
                  deleteRelease(r.id).then(() => {
                    successAlert(intl.formatMessage({ id: 'pages.message.release.delete.success' }));
                    history.go(0);
                  });
                },
              });
            }}
          >
            {intl.formatMessage({ id: 'pages.common.delete' })}
          </Button>
        </Space>
      ),
    },
  ];

  const locale = {
    emptyText: <NoData
      titleID="pages.common.release"
      descID="pages.noData.release.desc"
    />,
  };

  const table = (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={releases}
      locale={locale}
      pagination={{
        position: ['bottomCenter'],
        hideOnSinglePage: true,
        total: releases?.length,
        pageSize: 7,
      }}
    />
  );

  return table;
};

export default () => {
  const { initialState } = useModel('@@initialState');

  if (!initialState) {
    return <NotFound />;
  }

  const { fullName, id } = initialState.resource;
  const { data: releases, refresh } = useRequest(() => queryReleases(id));

  if (!releases || !initialState.currentUser) {
    return <NotFound />;
  }

  return (
    <PageWithBreadcrumb>
      <ReleasesTable fullName={fullName} releases={releases} refresh={refresh} />
    </PageWithBreadcrumb>
  );
};
