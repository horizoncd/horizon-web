import { useState } from 'react';
import { history, useModel, useRequest } from 'umi';
import {
  Button, Modal, Space, Switch, Table,
} from 'antd';
import { useIntl } from '@@/plugin-locale/localeExports';
import { PageWithInitialState } from '@/components/Enhancement';
import { deleteWebhook, enableOrDisableWebhook, listWebhooks } from '@/services/webhooks/webhooks';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import Label from '@/components/Label';
import Description from '@/components/Description';
import { PopupTime } from '@/components/Widget';

type WebhookData = {
  key: number;
  id: number;
  enabled: boolean;
  url: string;
  triggers: string[];
  description: string;
  createdAt: string;
};

function WebhookList(props: { initialState: API.InitialState }) {
  const { initialState } = props;
  const {
    id: resourceID = 0,
    fullPath: resourceFullPath,
    type: resourceType,
  } = initialState.resource;

  const intl = useIntl();
  const [pageNumber, setPageNumber] = useState(1);
  const [total, setTotal] = useState(0);
  const [webhookTableData, setWebhookTableData] = useState<WebhookData[]>();
  const pageSize = 10;
  const { successAlert } = useModel('alert');
  const isAdminPage = resourceType === 'group' && resourceID === 0;

  const createWebhookURL = isAdminPage
    ? '/admin/webhooks/new'
    : `/${resourceType}s${resourceFullPath}/-/settings/newwebhook`;
  const getEditWebhookURL = (id: number) => {
    const editWebhookURL = isAdminPage
      ? `/admin/webhooks/${id}/edit`
      : `/${resourceType}s${resourceFullPath}/-/settings/webhooks/${id}/edit`;
    return editWebhookURL;
  };
  const getWebhookLogsURL = (id: number) => {
    const webhookLogsURL = isAdminPage
      ? `/admin/webhooks/${id}`
      : `/${resourceType}s${resourceFullPath}/-/settings/webhooks/${id}`;
    return webhookLogsURL;
  };

  const { data: webhooks, run: refreshWebhookList } = useRequest(
    () => listWebhooks(resourceType.concat('s'), resourceID, { pageNumber, pageSize }),
    {
      onSuccess: () => {
        const wh: WebhookData[] = webhooks!.items.map(
          (w: Webhooks.Webhook) => ({
            key: w.id,
            id: w.id,
            enabled: w.enabled,
            url: w.url,
            triggers: w.triggers,
            description: w.description,
            createdAt: w.createdAt,
          } as WebhookData),
        );
        setWebhookTableData(wh);
        setTotal(webhooks!.total);
      },
    },
  );

  const { run: toggleWebhookEnabled } = useRequest(
    (id: number, enabled: boolean) => enableOrDisableWebhook(id, enabled),
    {
      onSuccess: () => {
        successAlert(intl.formatMessage({ id: 'pages.webhook.list.alert.update success' }));
        refreshWebhookList();
      },
      manual: true,
    },
  );

  const columns = [
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      width: '150px',
    },
    {
      title: intl.formatMessage({ id: 'pages.webhook.list.columns.triggers' }),
      dataIndex: 'triggers',
      key: 'triggers',
      width: '25%',
      render: (triggers: string[]) => triggers.map((trigger) => <Label>{trigger}</Label>),
    },
    {
      title: intl.formatMessage({ id: 'pages.webhook.list.columns.desc' }),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: intl.formatMessage({ id: 'pages.webhook.list.columns.createdAt' }),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value: string) => <PopupTime time={value} />,
    },
    {
      title: intl.formatMessage({ id: 'pages.webhook.list.enable or not' }),
      key: 'enableOrDisable',
      render: (record: WebhookData) => (
        <Switch
          checked={record.enabled}
          onChange={() => toggleWebhookEnabled(record.id, !record.enabled)}
        />
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.webhook.list.columns.operations' }),
      key: 'operation',
      render: (record: WebhookData) => (
        <Space size="small">
          <Button
            type="link"
            onClick={() => {
              window.location.href = getWebhookLogsURL(record.id);
            }}
          >
            {intl.formatMessage({ id: 'pages.webhook.list.action.view log' })}
          </Button>
          <Button
            type="link"
            onClick={() => {
              window.location.href = getEditWebhookURL(record.id);
            }}
          >
            {intl.formatMessage({ id: 'pages.webhook.list.action.edit' })}
          </Button>
          <Button
            type="link"
            onClick={() => Modal.confirm({
              title: intl.formatMessage({ id: 'pages.webhook.list.action.delete.prompt' }),
              content: `${record.url}`,
              onOk: () => {
                deleteWebhook(record.id).then(() => {
                  successAlert(
                    intl.formatMessage({ id: 'pages.webhook.list.action.delete.success' }),
                  );
                  refreshWebhookList();
                });
              },
            })}
          >
            {intl.formatMessage({ id: 'pages.webhook.list.action.delete' })}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <PageWithBreadcrumb>
      <h1>Webhook</h1>
      <Description>{intl.formatMessage({ id: 'pages.webhook.list.desc' })}</Description>
      <Button
        type="primary"
        style={{ float: 'right', marginRight: '20px', marginBottom: '20px' }}
        onClick={() => history.push(createWebhookURL)}
      >
        {intl.formatMessage({ id: 'pages.webhook.list.action.create' })}
      </Button>
      <Table
        columns={columns}
        dataSource={webhookTableData}
        pagination={{
          position: ['bottomCenter'],
          current: pageNumber,
          hideOnSinglePage: true,
          total,
          onChange: (page) => setPageNumber(page),
        }}
      />
    </PageWithBreadcrumb>
  );
}

export default PageWithInitialState(WebhookList);
