import {
  Button, Form, Input, Space, Switch, Table, Tooltip, Tree,
} from 'antd';
import { history, useModel, useRequest } from 'umi';
import { useIntl } from '@@/plugin-locale/localeExports';
import { useState } from 'react';
import { Rule } from 'antd/lib/form';
import { retryWebhookLogs, listWebhookLogs } from '@/services/webhooks/webhooks';
import { Succeeded, Failed, Progressing } from '@/components/State';
import utils from '@/utils';
import { listEventActions } from '@/services/events/events';

const { TextArea } = Input;

const required = [{
  required: true,
}];

const urlRules: Rule[] = [{
  required: true,
  pattern: /(http|https):\/\/.*/,
}];

function WebhookConfig() {
  const { data: triggers = {} } = useRequest(
    () => listEventActions(),
  );

  const intl = useIntl();
  return (
    <>
      <Form.Item
        label="URL"
        name="url"
        extra={intl.formatMessage({ id: 'pages.webhook.component.form.url' })}
        rules={urlRules}
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

      <Form.Item
        name="triggers"
        label={intl.formatMessage({ id: 'pages.webhook.component.form.triggers' })}
        valuePropName="checkedKeys"
        trigger="onCheck"
        rules={required}
        getValueFromEvent={(triggerList) => {
          // when actions of one resource are all checked, only xxx_* is kept
          const arrChangeMap = (arr: string[]) => new Map(arr.map((v, index) => [v, index]));
          let result: string[] = [];
          const ts = arrChangeMap(triggerList);
          ts.forEach((_, trigger) => {
            if (trigger.indexOf('*') !== -1) {
              result = result.concat(trigger);
              return;
            }
            const parts = trigger.split('_');
            if (parts.length < 2) {
              return;
            }
            const resource = parts[0];
            if (ts.has(`${resource}_*`)) {
              return;
            }
            result = result.concat(trigger);
          });
          return result;
        }}
      >
        <Tree
          checkable
          treeData={Object.keys(triggers).map((k) => ({
            title: k,
            key: `${k}_*`,
            children: triggers[k].map((trigger) => ({
              title: trigger,
              key: `${k}_${trigger}`,
            })),
          }))}
        />
      </Form.Item>
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
        {intl.formatMessage({ id: 'pages.webhook.component.form.cancel' })}
      </Button>
      <Button
        type="primary"
        htmlType="submit"
      >
        {intl.formatMessage({ id: 'pages.webhook.component.form.submit' })}
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
  const { data: webhookLogsResp, run: refreshWebhookLogs } = useRequest(() => listWebhookLogs(
    webhookID,
    { pageNumber, pageSize },
  ), {
    refreshDeps: [pageNumber, pageSize],
  });
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
        } if (status === 'waiting') {
          return <Progressing text="Waiting" />;
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
            onClick={() => {
              retryWebhookLogs(record.id).then(
                () => {
                  successAlert(intl.formatMessage({ id: 'pages.webhook.component.table.operations.retry.prompt' }));
                  refreshWebhookLogs();
                },
              );
            }}
          >
            {intl.formatMessage({ id: 'pages.webhook.component.table.operations.retry' })}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={webhookLogsResp?.items}
      pagination={{
        position: ['bottomCenter'],
        current: pageNumber,
        hideOnSinglePage: true,
        total: webhookLogsResp?.total || 1,
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
  WebhookConfig,
  WebhookButtons,
  WebhookLogs,
};
