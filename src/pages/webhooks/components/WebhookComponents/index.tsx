import {
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  Radio,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tooltip,
} from 'antd';
import { history, useModel, useRequest } from 'umi';
import { useIntl } from '@@/plugin-locale/localeExports';
import { useState } from 'react';
import { FormProps, Rule } from 'antd/lib/form';
import styled from 'styled-components';
import YAML from 'yaml';
import { resendWebhookLogs, listWebhookLogs } from '@/services/webhooks/webhooks';
import { Succeeded, Failed, Progressing } from '@/components/State';
import utils from '@/utils';
import { listSupportEvents } from '@/services/events/events';
import Label from '@/components/Label';
import Title from '@/components/Title';
import { PopupTime } from '@/components/Widget';

const { TextArea } = Input;

const required = [
  {
    required: true,
  },
];

const urlRules: Rule[] = [
  {
    required: true,
    pattern: /(http|https):\/\/.*/,
  },
];

const Description = styled.div`
  color: rgba(0, 0, 0, 0.45);
  font-size: '8px';
`;

function WebhookButtons(props: { onCancel: () => void }) {
  const intl = useIntl();
  const { onCancel } = props;
  return (
    <Space size="large" style={{ float: 'right' }}>
      <Button onClick={onCancel}>
        {intl.formatMessage({ id: 'pages.webhook.component.form.cancel' })}
      </Button>
      <Button type="primary" htmlType="submit">
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
  url: string;
  enabled: boolean;
  secret: string;
  description: string;
  sslVerifyEnabled: boolean;
  eventsSelectionMode: EventsSelectionMode;
  selectedEvents: string[];
};

function WebhookConfig(
  props: FormProps & { onCancel: () => void; data?: Webhooks.CreateOrUpdateWebhookReq | undefined },
) {
  const { onFinish, onCancel, data } = props;
  const { data: eventWithDescs = {} } = useRequest(() => listSupportEvents());
  const [form] = Form.useForm();
  const [isSSL, setIsSSL] = useState(false);

  const [eventsSelectionMode, setEventsSelectionMode] = useState(
    !data || (data?.triggers.length === 1 && data.triggers[0] === '*')
      ? EventsSelectionMode.everything
      : EventsSelectionMode.part,
  );

  if (data) {
    const formData: FormData = {
      url: data.url,
      description: data.description,
      enabled: data.enabled,
      sslVerifyEnabled: data.sslVerifyEnabled,
      secret: data.secret,
      eventsSelectionMode,
      selectedEvents: [],
    };
    if (eventsSelectionMode === EventsSelectionMode.part) {
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
        eventsSelectionMode: EventsSelectionMode.everything,
      }}
      onFinish={(formData: FormData) => {
        if (onFinish) {
          const req: Webhooks.CreateOrUpdateWebhookReq = {
            url: formData.url,
            enabled: data?.enabled ?? true,
            secret: formData.secret,
            description: formData.description,
            sslVerifyEnabled: formData.sslVerifyEnabled ?? false,
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
        <Input
          onChange={
            (e) => {
              setIsSSL(e.target.value.startsWith('https://'));
            }
          }
        />
      </Form.Item>
      {
        isSSL && (
        <Form.Item
          name="sslVerifyEnabled"
          label={intl.formatMessage({ id: 'pages.webhook.component.form.sslVerify' })}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        )
      }
      <Form.Item
        label={intl.formatMessage({ id: 'pages.webhook.component.form.desc' })}
        name="description"
      >
        <TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
      </Form.Item>
      <Form.Item
        label="Secret"
        name="secret"
        extra={intl.formatMessage({ id: 'pages.webhook.component.form.secret.extra' })}
      >
        <Input />
      </Form.Item>
      <Form.Item label={intl.formatMessage({ id: 'pages.webhook.component.form.triggers' })}>
        <Form.Item name="eventsSelectionMode">
          <Radio.Group
            onChange={(e) => {
              setEventsSelectionMode(e.target.value);
            }}
          >
            <Space direction="vertical">
              <Radio value={EventsSelectionMode.everything}>
                {intl.formatMessage({ id: 'pages.webhook.component.selectMode.everything' })}
              </Radio>
              <Radio value={EventsSelectionMode.part}>
                {intl.formatMessage({ id: 'pages.webhook.component.selectMode.part' })}
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
        {eventsSelectionMode === EventsSelectionMode.part && (
          <Form.Item name="selectedEvents" rules={required}>
            <Checkbox.Group
              style={{
                marginLeft: '20px',
              }}
            >
              <Row>
                {Object.keys(eventWithDescs).map((event) => (
                  <Col key={event} span={12}>
                    <Checkbox value={event}>
                      <div>{event}</div>
                      <Description>{eventWithDescs[event]}</Description>
                    </Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>
        )}
      </Form.Item>
      <WebhookButtons onCancel={onCancel} />
    </Form>
  );
}

WebhookConfig.defaultProps = {
  data: undefined,
};

function WebhookLogs(props: { webhookID: number; detailURL: string }) {
  const intl = useIntl();
  const { webhookID, detailURL } = props;
  const { successAlert } = useModel('alert');
  const pageSize = 10;
  const [pageNumber, setPageNumber] = useState(1);
  const [eventType, setEventType] = useState('');
  const [filter, setFilter] = useState('');

  const { data: eventWithDescs = {} } = useRequest(() => listSupportEvents());

  const { data: webhookLogsResp, run: refreshWebhookLogs } = useRequest(
    () => listWebhookLogs(webhookID, {
      pageNumber,
      pageSize,
      filter,
      eventType,
    }),
    {
      refreshDeps: [pageNumber, pageSize, filter, eventType],
    },
  );
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: number) => (
        <Button style={{ padding: 0 }} type="link" onClick={() => history.push(detailURL + id)}>
          {`#${id}`}
        </Button>
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.webhook.component.table.resource' }),
      key: 'resource',
      render: (record: Webhooks.LogSummary) => (
        <span>{`${record.resourceName}(${record.resourceID})`}</span>
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.webhook.component.table.eventType' }),
      key: 'eventType',
      dataIndex: 'eventType',
      render: (event: string) => <Label>{event}</Label>,
    },
    {
      title: intl.formatMessage({ id: 'pages.webhook.component.table.status' }),
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Webhooks.LogSummary) => {
        if (status === 'success') {
          return <Succeeded />;
        }
        if (status === 'waiting') {
          return <Progressing text="Waiting" />;
        }
        if (status === 'failed') {
          return (
            <Tooltip title={record.errorMessage}>
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
        <div>{`${utils.timeSecondsDuration(record.createdAt, record.updatedAt)}s`}</div>
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.webhook.component.table.createdAt' }),
      key: 'created_at',
      render: (record: Webhooks.LogSummary) => <PopupTime time={record.createdAt} />,
    },
    {
      title: intl.formatMessage({ id: 'pages.webhook.component.table.operations' }),
      key: 'operation',
      render: (record: Webhooks.LogSummary) => (
        <Space>
          <Button
            style={{ padding: 0 }}
            type="link"
            onClick={() => {
              resendWebhookLogs(record.id).then(() => {
                successAlert(
                  intl.formatMessage({
                    id: 'pages.webhook.component.table.operations.retry.prompt',
                  }),
                );
                refreshWebhookLogs();
              });
            }}
          >
            {intl.formatMessage({ id: 'pages.webhook.component.table.operations.retry' })}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Input.Group
        compact
        style={{
          float: 'right',
          display: 'flex',
          marginBottom: '20px',
          width: '700px',
        }}
      >
        <Select
          placeholder={intl.formatMessage({
            id: 'pages.webhook.component.search.select.placeholder',
          })}
          style={{
            width: '300px',
          }}
          defaultValue="all"
          onSelect={(value: string) => {
            if (value === 'all') {
              setEventType('');
            } else {
              setEventType(value);
            }
          }}
        >
          <Select.Option key="all" value="all">
            {intl.formatMessage({ id: 'pages.webhook.component.search.select.all' })}
          </Select.Option>
          {Object.keys(eventWithDescs).map((event) => (
            <Select.Option key={event} value={event}>
              {event}
            </Select.Option>
          ))}
        </Select>
        <Input.Search
          placeholder={intl.formatMessage({
            id: 'pages.webhook.component.search.input.placeholder',
          })}
          onSearch={(value) => setFilter(value)}
        />
      </Input.Group>
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
    </div>
  );
}

function WebhookLogDetail(props: { webhookLog: Webhooks.Log | undefined }) {
  const intl = useIntl();
  const { webhookLog } = props;
  const BasicInfo = styled.div`
    margin-block: 15px;
  `;

  // this style refers to gitlab
  const ContentBlock = styled.pre`
    background-color: #fafafa;
    border-radius: 2px;
    border: 1px solid #dbdbdb;
    padding: 8px 12px;
    font-size: 0.8125rem;
  `;

  const parsedHeaders = YAML.parse(webhookLog?.requestHeaders || '{}');
  // transfer headers from yaml-string to k: v1;v2
  const headers = Object.keys(parsedHeaders)
    .map((key: string) => `${key}: ${parsedHeaders[key].join(';')}`).join('\n');

  return (
    <Card>
      <BasicInfo>
        <Title>{intl.formatMessage({ id: 'pages.webhook.log.detail.url.title' })}</Title>
        <span>{webhookLog?.url}</span>
      </BasicInfo>
      <BasicInfo>
        <Title>{intl.formatMessage({ id: 'pages.webhook.log.detail.duration.title' })}</Title>
        <span>
          {utils.timeSecondsDuration(webhookLog?.createdAt || '', webhookLog?.updatedAt || '')}
          s
        </span>
      </BasicInfo>
      <BasicInfo>
        <Title>{intl.formatMessage({ id: 'pages.webhook.log.detail.createdAt.title' })}</Title>
        <span>{webhookLog?.createdAt}</span>
      </BasicInfo>
      <Divider />
      <Title>{intl.formatMessage({ id: 'pages.webhook.log.detail.requestHeader.title' })}</Title>
      <ContentBlock>
        { headers }
      </ContentBlock>
      <Title>{intl.formatMessage({ id: 'pages.webhook.log.detail.requestBody.title' })}</Title>
      <ContentBlock>
        {JSON.stringify(JSON.parse(webhookLog?.requestData || '{}'), null, 4)}
      </ContentBlock>
      <Title>{intl.formatMessage({ id: 'pages.webhook.log.detail.responseHeader.title' })}</Title>
      <ContentBlock>{webhookLog?.responseHeaders}</ContentBlock>
      <Title>{intl.formatMessage({ id: 'pages.webhook.log.detail.responseBody.title' })}</Title>
      <ContentBlock>{webhookLog?.responseBody}</ContentBlock>
    </Card>
  );
}

export {
  WebhookConfig, WebhookButtons, WebhookLogs, WebhookLogDetail,
};
