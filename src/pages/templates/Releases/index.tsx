import {
  Space, Button, Table, Modal,
} from 'antd';
import { useRequest } from '@@/plugin-request/request';
import { history } from '@@/core/history';
import { FireOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import NoData from '@/components/NoData';
import {
  deleteRelease, queryReleases, StatusCode, syncReleaseToRepo,
} from '@/services/templates/templates';
import { NotFount } from '@/components/State';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import RBAC from '@/rbac';
import SyncStatus from './Components/SyncStatus';

export const ReleasesTable = (props: { fullName: string, releases: Templates.Release[], refresh: () => void }) => {
  const { releases, fullName, refresh } = props;
  const { successAlert } = useModel('alert');

  const columns = [
    {
      title: '版本',
      dataIndex: 'name',
      render: (name: string, t: Templates.Release) => (
        <Space size="middle">
          <a href={`/templates/${fullName}/-/releases/${t.name}`}>{name}</a>
        </Space>
      ),
    },
    {
      title: '推荐',
      render: (recommended: boolean) => (recommended && <FireOutlined style={{ color: '#FF4500' }} />),
      dataIndex: 'recommended',
    },
    {
      title: 'Commit ID',
      dataIndex: 'commitID',
    },
    {
      title: '同步状态',
      dataIndex: 'syncStatusCode',
      render: (syncStatus: StatusCode) => <SyncStatus statusCode={syncStatus} />,
    },
    {
      title: '最后同步时间',
      dataIndex: 'lastSyncAt',
      render: (syncTime: string) => new Date(syncTime).toLocaleString(),
    },
    {
      title: '操作',
      dataIndex: 'name',
      render: (name: string, r: Templates.Release) => (
        <Space size="middle">
          <Button
            type="primary"
            disabled={r.syncStatus === 'Succeed'
          || !RBAC.Permissions.syncRelease.allowed}
            onClick={() => {
              syncReleaseToRepo(r.id).then(() => {
                successAlert('同步Release成功');
              }).then(refresh);
            }}
          >
            同步
          </Button>

          <Button
            type="primary"
            disabled={!RBAC.Permissions.updateRelease.allowed}
            onClick={() => { window.location.href = `/templates/${fullName}/-/releases/${r.name}/edit`; }}
          >
            修改
          </Button>
          <Button
            type="primary"
            disabled={!RBAC.Permissions.deleteRelease.allowed}
            danger
            onClick={() => {
              Modal.confirm({
                title: `确认删除Release: ${r.name}`,
                content: '该release有可能正在被application或cluster使用，删除前请确认',
                onOk: () => {
                  deleteRelease(r.id).then(() => {
                    successAlert('删除Release成功');
                    history.go(0);
                  });
                },
              });
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const locale = {
    emptyText: <NoData
      title="releases"
      desc="release是发布template的具体版本，和gitlab tag相关联"
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
    return <NotFount />;
  }

  const { fullName, id } = initialState.resource;
  const { data: releases, refresh } = useRequest(() => queryReleases(id));

  if (!releases || !initialState.currentUser) {
    return <NotFount />;
  }

  return (
    <PageWithBreadcrumb>
      <ReleasesTable fullName={fullName} releases={releases} refresh={refresh} />
    </PageWithBreadcrumb>
  );
};
