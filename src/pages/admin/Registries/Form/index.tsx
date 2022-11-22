import {
  Button, Form, Input, Select,
} from 'antd';
import { useIntl, useRequest } from 'umi';
import common from '@/pages/admin/common';
import { getKinds } from '@/services/registries/registries';

const { Option } = Select;

function RegistryForm() {
  const intl = useIntl();
  const { data: kinds } = useRequest(getKinds);

  const formatMessage = (suffix: string) => intl.formatMessage({ id: `pages.registry.${suffix}` });

  return (
    <div>
      <Form.Item
        label={formatMessage('name')}
        name="name"
        rules={[{ required: true }]}
        extra={intl.formatMessage({ id: 'pages.message.registry.name.extra' })}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Server"
        name="server"
        rules={common.formRules.url}
        extra={intl.formatMessage({ id: 'pages.message.registry.server.extra' })}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label={formatMessage('path')}
        name="path"
        rules={[{ required: true }]}
        extra={intl.formatMessage({ id: 'pages.message.registry.path.extra' })}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Token"
        name="token"
        rules={[{ required: true }]}
        extra={intl.formatMessage({ id: 'pages.message.registry.token.extra' })}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label={formatMessage('tls')}
        name="insecureSkipTLSVerify"
        rules={[{ required: true }]}
        extra={intl.formatMessage({ id: 'pages.message.registry.tls.extra' })}
      >
        <Select>
          {/* eslint-disable-next-line react/jsx-boolean-value */}
          <Option value={true}>{intl.formatMessage({ id: 'pages.common.yes' })}</Option>
          <Option value={false}>{intl.formatMessage({ id: 'pages.common.no' })}</Option>
        </Select>
      </Form.Item>
      <Form.Item
        label={formatMessage('type')}
        name="kind"
        rules={[{ required: true }]}
        extra={intl.formatMessage({ id: 'pages.message.registry.type.extra' })}
      >
        <Select>
          {
            kinds?.map((kind) => <Option value={kind}>{kind}</Option>)
          }
        </Select>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          {intl.formatMessage({ id: 'pages.common.submit' })}
        </Button>
      </Form.Item>
    </div>
  );
}

export default RegistryForm;
