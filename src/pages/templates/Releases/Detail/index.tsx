import { history, useIntl, useModel } from 'umi';
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
  const intl = useIntl();
  const releaseID = initialState.resource.id;
  const { fullName } = initialState.resource;
  const { data: release, refresh } = useRequest(() => getRelease(releaseID));
  const matches = /(.*)\/(.*?)\/?$/.exec(fullName);
  if (matches === null) {
    return <div />;
  }
  const [, templatePath, releasePath] = matches;

  const formatMessage = (suffix: string) => intl.formatMessage({ id: `pages.template.${suffix}` });

  const data: Param[][] = [
    [
      {
        key: formatMessage('release'),
        value: release?.name,
      },
      {
        key: formatMessage('recommended'),
        value: release?.recommended ? <FireOutlined style={{ color: '#FF4500' }} /> : formatMessage('recommended.no'),
      },
      {
        key: formatMessage('description'),
        value: release?.description,
      },
    ],
    [
      {
        key: 'Commit ID',
        value: release?.commitID,
      },
      {
        key: formatMessage('release.syncStatus'),
        value: <SyncStatus statusCode={release?.syncStatusCode} />,
      },
      {
        key: formatMessage('release.lastSyncAt'),
        value: new Date(release?.lastSyncAt ?? '').toLocaleString(),
      },
    ],
    [
      {
        key: formatMessage('createdAt'),
        value: new Date(release?.createdAt ?? '').toLocaleString(),
      },
      {
        key: formatMessage('updatedAt'),
        value: new Date(release?.updatedAt ?? '').toLocaleString(),
      },
    ],
  ];

  if (!release || release.syncStatus === 'Failed') {
    data[1].push({
      key: formatMessage('release.failReason'),
      value: release?.failedReason,
    });
  }

  return (
    <PageWithBreadcrumb>
      <DetailCard
        title={intl.formatMessage({ id: 'pages.common.basicInfo' })}
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
                  successAlert(intl.formatMessage({ id: 'pages.message.release.sync.success' }));
                });
              }}
            >
              {formatMessage('release.sync')}
            </Button>
            <Button
              type="primary"
              disabled={!rbac.Permissions.updateRelease.allowed}
              onClick={() => {
                history.push(`/templates/${templatePath}/-/releases/${releasePath}/edit`);
                refresh();
              }}
            >
              {intl.formatMessage({ id: 'pages.common.edit' })}
            </Button>
            <Button
              danger
              type="primary"
              disabled={!rbac.Permissions.deleteRelease.allowed}
              onClick={() => {
                Modal.confirm({
                  title: intl.formatMessage({ id: 'pages.message.release.delete.confirm' }, { release: release.name }),
                  content: intl.formatMessage({ id: 'pages.message.release.delete.content' }),
                  onOk: () => {
                    deleteRelease(releaseID).then(() => {
                      successAlert(intl.formatMessage({ id: 'pages.message.release.delete.success' }));
                      window.location.href = (`/templates/${templatePath}/-/detail`);
                    });
                  },
                });
              }}
            >
              {intl.formatMessage({ id: 'pages.common.delete' })}
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
