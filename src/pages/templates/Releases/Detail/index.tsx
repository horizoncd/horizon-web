import { history, useModel } from 'umi';
import { useRequest } from '@@/plugin-request/request';
import { FireOutlined } from '@ant-design/icons';
import { Space, Button, Modal } from 'antd';
import {
  deleteRelease,
  getRelease,
  syncReleaseToRepo,
} from '@/services/templates/templates';
import type { Param } from '@/components/DetailCard';
import SyncStatus from '../Components/SyncStatus';
import { API } from '@/services/typings';
import DetailCard from '@/components/DetailCard';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import rbac from '@/rbac';
import ReleaseTab from './Tree';
import { PageWithInitialState } from '@/components/Enhancement';

function ReleaseDetail(props: { initialState: API.InitialState }): React.ReactElement {
  const { initialState } = props;
  const { successAlert } = useModel('alert');
  const releaseID = initialState.resource.id;
  const { fullName } = initialState.resource;
  const { data: release, refresh } = useRequest(() => getRelease(releaseID));
  const matches = /(.*)\/(.*?)\/?$/.exec(fullName);
  if (matches === null) {
    return <div />;
  }
  const [, templatePath, releasePath] = matches;

  const data: Param[][] = [
    [
      {
        key: '版本',
        value: release?.name,
      },
      {
        key: '推荐',
        value: release?.recommended ? <FireOutlined style={{ color: '#FF4500' }} /> : '非推荐版本',
      },
      {
        key: '描述',
        value: release?.description,
      },
    ],
    [
      {
        key: 'Commit ID',
        value: release?.commitID,
      },
      {
        key: '同步状态',
        value: <SyncStatus statusCode={release?.syncStatusCode} />,
      },
      {
        key: '最后同步时间',
        value: new Date(release?.lastSyncAt ?? '').toLocaleString(),
      },
    ],
    [
      {
        key: '创建日期',
        value: new Date(release?.createdAt ?? '').toLocaleString(),
      },
      {
        key: '更新日期',
        value: new Date(release?.updatedAt ?? '').toLocaleString(),
      },
    ],
  ];

  if (!release || release.syncStatus === 'Failed') {
    data[1].push({
      key: '失败原因',
      value: release?.failedReason,
    });
  }

  return (
    <PageWithBreadcrumb>
      <DetailCard
        title={<span>基础信息</span>}
        data={data}
        extra={(
          release?.id && (
          <Space>
            <Button
              type="primary"
              disabled={!release || release.syncStatus === 'Succeed'
                || !rbac.Permissions.syncRelease.allowed}
              onClick={() => {
                syncReleaseToRepo(release.id).then(() => {
                  successAlert('同步Release成功');
                });
              }}
            >
              同步
            </Button>
            <Button
              type="primary"
              disabled={!rbac.Permissions.updateRelease.allowed}
              onClick={() => {
                history.push(`/templates/${templatePath}/-/releases/${releasePath}/edit`);
                refresh();
              }}
            >
              编辑
            </Button>
            <Button
              danger
              type="primary"
              disabled={!rbac.Permissions.deleteRelease.allowed}
              onClick={() => {
                Modal.confirm({
                  title: `确认删除Release: ${release?.name}`,
                  content: '该版本template有可能正在被application或cluster使用，删除前请确认',
                  onOk: () => {
                    deleteRelease(releaseID).then(() => {
                      successAlert('删除Release成功');
                      window.location.href = (`/templates/${templatePath}/-/detail`);
                    });
                  },
                });
              }}
            >
              删除
            </Button>
          </Space>
          )
        )}
      />
      {
        (release?.templateName && release?.name)
        && <ReleaseTab template={release.templateName} release={release?.name} />
      }
    </PageWithBreadcrumb>
  );
}

export default PageWithInitialState(ReleaseDetail);
