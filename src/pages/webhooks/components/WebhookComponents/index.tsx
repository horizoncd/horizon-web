import {
  Button, Checkbox, CheckboxOptionType, Col, Form, Input, Row, Space, Switch, Table,
} from 'antd';
import { history, useModel, useRequest } from 'umi';
import { useState } from 'react';
import { retryWebhookLogs, listWebhookLogs } from '@/services/webhooks/webhooks';
import { Succeeded, Failed, Progressing } from '@/components/State';
import Label from '@/components/Label';
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
  return (
    <>
      <Form.Item
        label="URL"
        name="url"
        extra="仅支持http/https"
        rules={required}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="enabled"
        label="是否启用"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>
      <Form.Item label="描述" name="description">
        <TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
      </Form.Item>
      <Form.Item label="Secret" name="secret" extra="Secret会被放在 X-Horizon-Webhook-Secret 中发送">
        <Input />
      </Form.Item>
      <Form.Item
        name="sslVerifyEnabled"
        label="是否校验tls证书"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      <div>
        触发条件
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
  const { onCancel } = props;
  return (
    <Space
      size="large"
      style={{ float: 'right' }}
    >
      <Button
        onClick={onCancel}
      >
        取消
      </Button>
      <Button
        type="primary"
        htmlType="submit"
      >
        确定
      </Button>
    </Space>
  );
}

function WebhookLogs(props: { webhookID: number, detailURL: string }) {
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
      title: '触发事件',
      dataIndex: 'trigger',
      key: 'trigger',
      render: (trigger: string) => (
        <Label>
          {trigger}
        </Label>
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (status === 'success') {
          return <Succeeded />;
        } if (status === 'failed') {
          return <Failed />;
        }
        return <Progressing text={status} />;
      },
    },
    {
      title: '耗时',
      key: 'duration',
      render: (record: Webhooks.LogSummary) => (
        <div>
          {utils.timeSecondsDuration(record.createdAt, record.updatedAt)}
          s
        </div>
      ),
    },
    {
      title: '发送时间',
      key: 'created_at',
      render: (record: Webhooks.LogSummary) => (
        <div>
          {record?.createdAt}
        </div>
      ),
    },
    {
      title: '操作',
      key: 'operation',
      render: (record: Webhooks.LogSummary) => (
        <Space>
          <Button
            type="link"
            onClick={() => { retryWebhookLogs(record.id).then(() => successAlert('开始重新发送该请求')); }}
          >
            重新发送
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
