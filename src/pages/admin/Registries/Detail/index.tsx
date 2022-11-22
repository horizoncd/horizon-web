import { useIntl, useParams } from 'umi';
import { useRequest } from '@@/plugin-request/request';
import { history } from '@@/core/history';
import { Button, Modal, Space } from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import Utils from '@/utils';
import { deleteRegistryByID, getRegistryByID } from '@/services/registries/registries';
import NotFound from '@/pages/404';
import DetailCard, { Param } from '@/components/DetailCard';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';

export default () => {
  const intl = useIntl();
  const params = useParams<{ id: string }>();
  if (!params.id || isNaN(parseInt(params.id, 10))) {
    return <NotFound />;
  }

  const { successAlert } = useModel('alert');
  const registryID = parseInt(params.id, 10);
  const { data: registry } = useRequest(() => getRegistryByID(registryID), {});

  const formatMessage = (suffix: string) => intl.formatMessage({ id: `pages.registry.${suffix}` });

  const data: Param[][] = [
    [
      {
        key: formatMessage('name'),
        value: registry?.name,
      },
      {
        key: 'Server',
        value: registry?.server,
      },
      {
        key: formatMessage('path'),
        value: registry?.path,
      },
      {
        key: 'Token',
        value: registry?.token,
      },
    ],
    [
      {
        key: formatMessage('tls'),
        value: JSON.stringify(registry?.insecureSkipTLSVerify),
      },
      {
        key: formatMessage('type'),
        value: registry?.kind,
      },
      {
        key: formatMessage('createdAt'),
        value: Utils.timeToLocal(registry?.createdAt || ''),
      },
      {
        key: formatMessage('updatedAt'),
        value: Utils.timeToLocal(registry?.updatedAt || ''),
      },
    ],
  ];

  return (
    <PageWithBreadcrumb>
      <DetailCard
        title={intl.formatMessage({ id: 'pages.common.basicInfo' })}
        data={data}
        extra={(
          <Space>
            <Button
              type="primary"
              onClick={() => {
                history.push(`/admin/registries/${registryID}/edit`);
              }}
            >
              {intl.formatMessage({ id: 'pages.common.edit' })}
            </Button>
            <Button
              danger
              onClick={() => {
                Modal.confirm({
                  title: intl.formatMessage({ id: 'pages.message.registry.delete.confirm' }, { name: registry?.name }),
                  onOk: () => {
                    deleteRegistryByID(registryID).then(() => {
                      successAlert(intl.formatMessage({ id: 'pages.common.delete.success' }));
                      history.push('/admin/registries');
                    });
                  },
                });
              }}
            >
              {intl.formatMessage({ id: 'pages.common.delete' })}
            </Button>
          </Space>
        )}
      />
    </PageWithBreadcrumb>
  );
};
