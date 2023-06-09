import { useIntl, useParams } from 'umi';
import { useRequest } from '@@/plugin-request/request';
import { history } from '@@/core/history';
import {
  Button, Card, Divider, Form, Modal, Select, Space, Table,
} from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import { CheckOutlined } from '@ant-design/icons';
import { useState } from 'react';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import { deleteEnvironmentByID, getEnvironmentByID } from '@/services/environments/environments';
import {
  createEnvironmentRegion,
  deleteEnvironmentRegionByID,
  queryEnvironmentRegions,
  setDefault,
  setEnvironmentRegionAutoFree,
} from '@/services/environmentregions/environmentregions';
import Utils from '@/utils';
import NotFound from '@/pages/404';
import DetailCard, { Param } from '@/components/DetailCard';
import { queryRegions } from '@/services/regions/regions';

const { Option } = Select;

export default () => {
  const intl = useIntl();
  const params = useParams<{ id: string }>();
  if (!params.id || Number.isNaN(parseInt(params.id, 10))) {
    return <NotFound />;
  }

  const { successAlert } = useModel('alert');
  const [regionForm] = Form.useForm();
  const [regionModalVisible, setRegionModalVisible] = useState(false);
  const environmentID = parseInt(params.id, 10);
  const { data: environment } = useRequest(() => getEnvironmentByID(environmentID), {});
  const { data: environmentRegions, run: runEnvRegions } = useRequest(() => queryEnvironmentRegions(environment!.name), {
    ready: !!environment,
  });
  const { run: setAutoFree } = useRequest(setEnvironmentRegionAutoFree, {
    manual: true,
  });

  const { data: regions } = useRequest(() => queryRegions(), {});

  const formatMessage = (suffix: string) => intl.formatMessage({ id: `pages.environment.${suffix}` });

  const data: Param[][] = [
    [
      {
        key: intl.formatMessage({ id: 'pages.common.env' }),
        value: environment?.name,
      },
      {
        key: formatMessage('displayName'),
        value: environment?.displayName,
      },
    ],
    [
      {
        key: formatMessage('createdAt'),
        value: Utils.timeToLocal(environment?.createdAt || ''),
      },
      {
        key: formatMessage('updatedAt'),
        value: Utils.timeToLocal(environment?.updatedAt || ''),
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
                history.push(`/admin/environments/${environmentID}/edit`);
              }}
            >
              {intl.formatMessage({ id: 'pages.common.edit' })}
            </Button>
            <Button
              danger
              onClick={() => {
                Modal.confirm({
                  title: intl.formatMessage({ id: 'pages.message.environment.delete.confirm' }, { name: environment?.displayName }),
                  onOk: () => {
                    deleteEnvironmentByID(environmentID).then(() => {
                      successAlert(intl.formatMessage({ id: 'pages.message.environment.delete.success' }));
                      history.push('/admin/environments');
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
      <Card
        title={formatMessage('k8s.associated')}
        extra={(
          <Button
            type="primary"
            onClick={() => {
              setRegionModalVisible(true);
            }}
          >
            {formatMessage('k8s.add')}
          </Button>
    )}
      >
        <Table
          columns={
          [
            {
              title: formatMessage('k8s'),
              dataIndex: 'regionDisplayName',
            },
            {
              title: formatMessage('k8s.default'),
              dataIndex: 'isDefault',
              render: (text: boolean) => (text ? <CheckOutlined /> : ''),
            },
            {
              title: formatMessage('k8s.status'),
              dataIndex: 'disabled',
              render: (disabled: boolean) => (disabled ? <span style={{ color: 'red' }}>{formatMessage('k8s.status.off')}</span> : formatMessage('k8s.status.on')),
            },
            {
              title: formatMessage('k8s.operation'),
              dataIndex: 'id',
              render: (id: number, record: SYSTEM.EnvironmentRegion) => (
                <div>
                  {
                      // eslint-disable-next-line jsx-a11y/anchor-is-valid, jsx-a11y/no-static-element-interactions
                    <Button
                      type="link"
                      disabled={record.isDefault || record.disabled}
                      onClick={() => {
                        Modal.confirm({
                          title: intl.formatMessage({ id: 'pages.message.k8s.setDefault.confirm' }),
                          onOk: () => {
                            setDefault(id).then(() => {
                              successAlert(intl.formatMessage({ id: 'pages.message.k8s.setDefault.success' }));
                              runEnvRegions();
                            });
                          },
                        });
                      }}
                    >
                      {formatMessage('k8s.setDefault')}
                    </Button>
                  }
                  <Divider type="vertical" />
                  {
                    // eslint-disable-next-line jsx-a11y/anchor-is-valid, jsx-a11y/no-static-element-interactions
                    <Button
                      type="link"
                      onClick={() => {
                        Modal.confirm({
                          title: intl.formatMessage({ id: 'pages.message.k8s.delete.association.confirm' }),
                          onOk: () => {
                            deleteEnvironmentRegionByID(id).then(() => {
                              successAlert(intl.formatMessage({ id: 'pages.message.k8s.delete.association.success' }));
                              runEnvRegions();
                            });
                          },
                        });
                      }}
                    >
                      {intl.formatMessage({ id: 'pages.common.delete' })}
                    </Button>
                  }
                  <Divider type="vertical" />
                  {
                    record.autoFree ? (
                      <Button
                        type="link"
                        disabled={record.disabled}
                        onClick={() => setAutoFree(record.id, false).then(() => runEnvRegions())}
                      >
                        {intl.formatMessage({ id: 'pages.admin.autofree.cancel' })}
                      </Button>
                    )
                      : (
                        <Button
                          type="link"
                          disabled={record.disabled}
                          onClick={() => setAutoFree(record.id, true).then(() => runEnvRegions())}
                        >
                          {intl.formatMessage({ id: 'pages.admin.autofree.set' })}
                        </Button>
                      )
                  }
                </div>
              ),
            },
          ]
        }
          dataSource={environmentRegions}
          pagination={false}
        />
      </Card>
      <Modal
        visible={regionModalVisible}
        onCancel={() => setRegionModalVisible(false)}
        onOk={() => {
          regionForm.submit();
        }}
      >
        <Form
          form={regionForm}
          layout="vertical"
          onFinish={(v) => {
            // create environmentRegion
            createEnvironmentRegion({
              ...v,
              environmentName: environment!.name,
            }).then(() => {
              successAlert(intl.formatMessage({ id: 'pages.common.create.success' }));
              runEnvRegions();
              setRegionModalVisible(false);
            });
          }}
        >
          <Form.Item label="Kubernetes" name="regionName" rules={[{ required: true }]}>
            <Select>
              {
              regions?.map((item) => <Option value={item.name}>{item.displayName}</Option>)
            }
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </PageWithBreadcrumb>
  );
};
