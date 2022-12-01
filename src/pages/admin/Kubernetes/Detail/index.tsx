import { useIntl, useParams } from 'umi';
import { useRequest } from '@@/plugin-request/request';
import { history } from '@@/core/history';
import {
  Button, Card, Modal, Popover, Space,
} from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import TextArea from 'antd/es/input/TextArea';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import {
  deleteRegionByID,
  getRegionByID,
  getRegionTags,
  updateRegionTags,
} from '@/services/regions/regions';
import Utils from '@/utils';
import NotFound from '@/pages/404';
import DetailCard, { Param } from '@/components/DetailCard';
import DynamicTagForm, { ValueType } from '@/components/DynamicTagForm';

export default () => {
  const intl = useIntl();
  const params = useParams<{ id: string }>();
  if (!params.id || Number.isNaN(parseInt(params.id, 10))) {
    return <NotFound />;
  }

  const { successAlert } = useModel('alert');
  const regionID = parseInt(params.id, 10);
  const { data: region } = useRequest(() => getRegionByID(regionID), {});

  const formatMessage = (suffix: string) => intl.formatMessage({ id: `pages.kubernetes.${suffix}` });

  const data: Param[][] = [
    [
      {
        key: formatMessage('name'),
        value: region?.name,
      },
      {
        key: formatMessage('displayName'),
        value: region?.displayName,
      },
      {
        key: 'Server',
        value: region?.server,
      },
      {
        key: formatMessage('registry'),
        value: region?.registry.name,
      },
    ],
    [
      {
        key: formatMessage('ingress'),
        value: region?.ingressDomain,
      },
      {
        key: formatMessage('prometheus'),
        value: region?.prometheusURL,
      },
      {
        key: formatMessage('certificate'),
        value: (
          <Popover
            overlayInnerStyle={{ width: 800 }}
            title={
              <TextArea value={region?.certificate} autoSize={{ minRows: 5 }} />
          }
            placement="bottom"
          >
            {formatMessage('certificate.show')}
          </Popover>
        ),
      },
      {
        key: formatMessage('status'),
        value: region?.disabled ? <span style={{ color: 'red' }}>{formatMessage('status.off')}</span> : formatMessage('status.on'),
      },
    ],
    [
      {
        key: formatMessage('createdAt'),
        value: Utils.timeToLocal(region?.createdAt || ''),
      },
      {
        key: formatMessage('updatedAt'),
        value: Utils.timeToLocal(region?.updatedAt || ''),
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
                history.push(`/admin/kubernetes/${regionID}/edit`);
              }}
            >
              {intl.formatMessage({ id: 'pages.common.edit' })}
            </Button>
            <Button
              danger
              onClick={() => {
                Modal.confirm({
                  title: intl.formatMessage({ id: 'pages.message.k8s.delete.confirm' }, { name: region?.name }),
                  content: intl.formatMessage({ id: 'pages.message.k8s.delete.content' }),
                  onOk: () => {
                    deleteRegionByID(regionID).then(() => {
                      successAlert(intl.formatMessage({ id: 'pages.common.delete.success' }));
                      history.push('/admin/kubernetes');
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
      <Card title={intl.formatMessage({ id: 'pages.tags.normal.manage' })}>
        <DynamicTagForm
          queryTags={() => getRegionTags(regionID)}
          updateTags={(tags) => updateRegionTags(regionID, tags)}
          valueType={ValueType.Single}
        />
      </Card>
    </PageWithBreadcrumb>
  );
};
