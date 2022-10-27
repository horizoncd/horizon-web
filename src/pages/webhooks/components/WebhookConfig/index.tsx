import {
  Button, Checkbox, CheckboxOptionType, Col, Form, Input, Row, Space, Switch,
} from 'antd';

const { TextArea } = Input;

const required = [{
  required: true,
}];

const ResourceTriggers = {
  application: [
    {
      label: 'application_created',
      value: 'application_created',
    },
    {
      label: 'application_deleted',
      value: 'application_deleted',
    },
    {
      label: 'application_transfered',
      value: 'application_transfered',
    },
  ],
  cluster: [
    {
      label: 'cluster_created',
      value: 'cluster_created',
    },
    {
      label: 'cluster_deleted',
      value: 'cluster_deleted',
    },
    {
      label: 'cluster_builded',
      value: 'cluster_builded',
    },
    {
      label: 'cluster_deployed',
      value: 'cluster_deployed',
    },
    {
      label: 'cluster_rollbacked',
      value: 'cluster_rollbacked',
    },
    {
      label: 'cluster_freed',
      value: 'cluster_freed',
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
        label="是否跳过tls证书认证"
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

function WebhookButtons() {
  return (
    <Space
      size="large"
      style={{ float: 'right' }}
    >
      <Button
        onClick={() => window.history.back()}
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

WebhookConfig.defaultProps = {
  id: 0,
  resourceType: 'group',
  resourceID: 0,
};

export {
  ResourceTriggers,
  WebhookConfig,
  WebhookButtons,
};
