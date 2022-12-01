import {
  Button, Checkbox, Col, Form, Input, Radio, Row, Space, Switch, Table, Tooltip,
} from 'antd';
import { history, useModel, useRequest } from 'umi';
import { useIntl } from '@@/plugin-locale/localeExports';
import { useState } from 'react';
import { FormProps, Rule } from 'antd/lib/form';
import styled from 'styled-components';
import { resendWebhookLogs, listWebhookLogs } from '@/services/webhooks/webhooks';
import { Succeeded, Failed, Progressing } from '@/components/State';
import utils from '@/utils';
import { listSupportEvents } from '@/services/events/events';

const { TextArea } = Input;

const required = [{
  required: true,
}];

const urlRules: Rule[] = [{
  required: true,
  pattern: /(http|https):\/\/.*/,
}];

const Description = styled.div`
    color: rgba(0, 0, 0, 0.45);
    font-size: '8px';
  `;

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

enum EventsSelectionMode {
  everything,
  part,
}

type FormData = {
  url: string,
  enabled: boolean,
  secret: string,
  description: string,
  sslVerifyEnabled: boolean,
  eventsSelectionMode: EventsSelectionMode,
  selectedEvents: string[],
};

function WebhookConfig(props: FormProps & { onCancel: ()=>void, data?: Webhooks.CreateOrUpdateWebhookReq | undefined }) {
  const {
    onFinish, onCancel, data,
  } = props;
  const { data: triggers = {} } = useRequest(
    () => listSupportEvents(),
  );
  const [form] = Form.useForm();
  const [eventsSelectionMode, setEventsSelectionMode] = useState(EventsSelectionMode.part);

  if (data) {
    const formData: FormData = {
      url: data.url,
      description: data.description,
      enabled: data.enabled,
      sslVerifyEnabled: data.sslVerifyEnabled,
      secret: data.secret,
      eventsSelectionMode: EventsSelectionMode.everything,
      selectedEvents: [],
    };
    if (!(data.triggers.length === 1 && data.triggers[0] === '*')) {
      formData.eventsSelectionMode = EventsSelectionMode.part;
      formData.selectedEvents = data.triggers;
    }
    form.setFieldsValue(formData);
  }

  const intl = useIntl();
  return (
    <Form
      initialValues={{
        enabled: true,
        sslVerifyEnabled: true,
        eventsSelectionMode: EventsSelectionMode.part,
      }}
      onFinish={(formData: FormData) => {
        if (onFinish) {
          const req: Webhooks.CreateOrUpdateWebhookReq = {
            url: formData.url,
            enabled: formData.enabled,
            secret: formData.secret,
            description: formData.description,
            sslVerifyEnabled: formData.sslVerifyEnabled,
            triggers: ['*'],
          };
          if (formData.eventsSelectionMode === EventsSelectionMode.part) {
            req.triggers = formData.selectedEvents;
          }
          onFinish(req);
        }
      }}
      form={form}
      layout="vertical"
    >
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
        label={intl.formatMessage({ id: 'pages.webhook.component.form.triggers' })}
      >
        <Form.Item
          name="eventsSelectionMode"
        >
          <Radio.Group
            onChange={(e) => {
              setEventsSelectionMode(e.target.value);
            }}
          >
            <Space direction="vertical">
              <Radio
                value={EventsSelectionMode.everything}
              >
                Send me everything
              </Radio>
              <Radio
                value={EventsSelectionMode.part}
              >
                Let me select individual events
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
        {
            eventsSelectionMode === EventsSelectionMode.part && (
            <Form.Item
              name="selectedEvents"
              rules={required}
            >
              <Checkbox.Group
                style={{
                  marginLeft: '20px',
                }}
              >
                <Row>
                  {
                  Object.keys(triggers).map((k) => triggers[k].map((trigger) => (
                    <Col
                      key={`${k}_${trigger.name}`}
                      span={12}
                    >
                      <Checkbox
                        value={`${k}_${trigger.name}`}
                      >
                        <div>
                          {`${k}_${trigger.name}`}
                        </div>
                        <Description>
                          {trigger.description}
                        </Description>
                      </Checkbox>
                    </Col>
                  )))
            }
                </Row>
              </Checkbox.Group>
            </Form.Item>
            )
         }
      </Form.Item>
      <WebhookButtons onCancel={onCancel} />
    </Form>
  );
}

WebhookConfig.defaultProps = {
  data: undefined,
};

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
              resendWebhookLogs(record.id).then(
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

export {
  WebhookConfig,
  WebhookButtons,
  WebhookLogs,
};
