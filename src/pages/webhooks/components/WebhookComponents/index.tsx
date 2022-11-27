import {
  Button, Checkbox, CheckboxOptionType, Col, Form, Input, Row, Space, Switch, Table, Tooltip,
} from 'antd';
import { history, useModel, useRequest } from 'umi';
import { useIntl } from '@@/plugin-locale/localeExports';
import { useState } from 'react';
import { retryWebhookLogs, listWebhookLogs } from '@/services/webhooks/webhooks';
import { Succeeded, Failed, Progressing } from '@/components/State';
import utils from '@/utils';

const { TextArea } = Input;

const required = [{
  required: true,
}];

const ResourceTriggers = {
  applications: [
    {
      label: 'applications_created',
      value: 'applications_created',
    },
    {
      label: 'applications_deleted',
      value: 'applications_deleted',
    },
    {
      label: 'applications_transfered',
      value: 'applications_transfered',
    },
  ],
  clusters: [
    {
      label: 'clusters_created',
      value: 'clusters_created',
    },
    {
      label: 'clusters_deleted',
      value: 'clusters_deleted',
    },
    {
      label: 'clusters_builded',
      value: 'clusters_builded',
    },
    {
      label: 'clusters_deployed',
      value: 'clusters_deployed',
    },
    {
      label: 'clusters_rollbacked',
      value: 'clusters_rollbacked',
    },
    {
      label: 'clusters_freed',
      value: 'clusters_freed',
    },
  ],
};

function WebhookConfig() {
  const intl = useIntl();
  return (
    <>
      <Form.Item
        label="URL"
        name="url"
        extra={intl.formatMessage({ id: 'pages.webhook.component.form.url' })}
        rules={required}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="enabled"
        label={intl.formatMessage({ id: 'pages.webhook.component.form.enabled' })}
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>
      <Form.Item label={intl.formatMessage({ id: 'pages.webhook.component.form.desc' })} name="description">
        <TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
      </Form.Item>
      <Form.Item label="Secret" name="secret" extra={intl.formatMessage({ id: 'pages.webhook.component.form.secret.extra' })}>
        <Input />
      </Form.Item>
      <Form.Item
        name="sslVerifyEnabled"
        label={intl.formatMessage({ id: 'pages.webhook.component.form.sslVerify' })}
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      <div>
        {intl.formatMessage({ id: 'pages.webhook.component.form.triggers' })}
      </div>
      <div
        style={{ padding: '20px' }}
      >
        {
          Object.keys(ResourceTriggers).map((k) => (
            <Form.Item
              label={k}
              name={k}
              key={k}
            >
              <Checkbox.Group
                style={{ marginLeft: '20px' }}
              >
                <Row>
                  {
                    ResourceTriggers[k].map((trigger: CheckboxOptionType) => (
                      <Col span={12}>
                        <Checkbox value={trigger.value}>
                          {trigger.value}
                        </Checkbox>
                      </Col>
                    ))
                  }
                </Row>
              </Checkbox.Group>
            </Form.Item>
          ))
        }
      </div>
    </>
  );
}

function WebhookButtons(props: { onCancel: ()=>void }) {
  const intl = useIntl();
  const { onCancel } = props;
  return (
    <Space
      size="large"
      style={{ float: 'right' }}
    >
      <Button
        onClick={onCancel}
      >
        {intl.formatMessage({ id: 'pages.webhook.component.form.submit' })}
      </Button>
      <Button
        type="primary"
        htmlType="submit"
      >
        {intl.formatMessage({ id: 'pages.webhook.component.form.cancel' })}
      </Button>
    </Space>
  );
}

function WebhookLogs(props: { webhookID: number, detailURL: string }) {
  const intl = useIntl();
  const { webhookID, detailURL } = props;
  const { successAlert } = useModel('alert');
  const pageSize = 10;
  const [pageNumber, setPageNumber] = useState(1);
  const [total, setTotal] = useState(0);
  const [webhookLogs, setWebhookLogs] = useState<Webhooks.LogSummary[]>([]);
  const columns = [
    {
      title: 'id',
      dataIndex: 'id',
      key: 'id',
      render: (id: number) => (
        <Button
          type="link"
          onClick={() => history.push(detailURL + id)}
        >
          #
          {id}
        </Button>
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.webhook.component.table.event' }),
      key: 'event',
      render: (record: Webhooks.LogSummary) => (
        <span>
          {`${record.action} ${record.resourceType} ${record.resourceName}(${record.resourceID})`}
        </span>
      ),
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      render: (url: string) => (
        <div>
          {url}
        </div>
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.webhook.component.table.status' }),
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Webhooks.LogSummary) => {
        if (status === 'success') {
          return <Succeeded />;
        } if (status === 'failed') {
          return (
            <Tooltip
              title={record.errorMessage}
            >
              <div>
                <Failed />
              </div>
            </Tooltip>
          );
        }
        return <Progressing text={status} />;
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.webhook.component.table.duration' }),
      key: 'duration',
      render: (record: Webhooks.LogSummary) => (
        <div>
          {utils.timeSecondsDuration(record.createdAt, record.updatedAt)}
          s
        </div>
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.webhook.component.table.createdAt' }),
      key: 'created_at',
      render: (record: Webhooks.LogSummary) => (
        <div>
          {record?.createdAt}
        </div>
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.webhook.component.table.operations' }),
      key: 'operation',
      render: (record: Webhooks.LogSummary) => (
        <Space>
          <Button
            type="link"
            onClick={() => { retryWebhookLogs(record.id).then(() => successAlert(intl.formatMessage({ id: 'pages.webhook.component.table.operation.retry.prompt' }))); }}
          >
            {intl.formatMessage({ id: 'pages.webhook.component.table.operations.retry' })}
          </Button>
        </Space>
      ),
    },
  ];

  const { data: webhookLogsResp } = useRequest(() => listWebhookLogs(
    webhookID,
    { pageNumber, pageSize },
  ), {
    onSuccess: () => {
      setWebhookLogs(webhookLogsResp!.items);
      setTotal(webhookLogsResp!.total);
    },
  });

  return (
    <Table
      columns={columns}
      dataSource={webhookLogs}
      pagination={{
        position: ['bottomCenter'],
        current: pageNumber,
        hideOnSinglePage: true,
        total,
        onChange: (page) => setPageNumber(page),
      }}
    />
  );
}

WebhookConfig.defaultProps = {
  id: 0,
  resourceType: 'group',
  resourceID: 0,
};

export {
  ResourceTriggers,
  WebhookConfig,
  WebhookButtons,
  WebhookLogs,
};
