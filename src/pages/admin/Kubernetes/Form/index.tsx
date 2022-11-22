import {
  Button, Form, Input, Select,
} from 'antd';
import { useRequest } from '@@/plugin-request/request';
import TextArea from 'antd/es/input/TextArea';
import { useIntl } from 'umi';
import { queryRegistries } from '@/services/registries/registries';
import common from '@/pages/admin/common';

const { Option } = Select;

export default () => {
  const { data: registries } = useRequest(() => queryRegistries(), {});
  const intl = useIntl();

  const formatMessage = (suffix: string) => intl.formatMessage({ id: `pages.kubernetes.${suffix}` });

  return (
    <div>
      <Form.Item
        label={formatMessage('displayName')}
        name="displayName"
        rules={[{ required: true }]}
        extra={intl.formatMessage({ id: 'pages.message.k8s.displayName.extra' })}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label={formatMessage('domain')}
        name="server"
        rules={common.formRules.url}
        extra={intl.formatMessage({ id: 'pages.message.k8s.domain.extra' })}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label={formatMessage('certificate')}
        name="certificate"
        rules={[{ required: true }]}
        extra={intl.formatMessage({ id: 'pages.message.k8s.certificate.extra' })}
      >
        <TextArea autoSize={{ minRows: 5 }} />
      </Form.Item>
      <Form.Item
        label={formatMessage('ingress')}
        name="ingressDomain"
        rules={common.formRules.domain}
        extra={intl.formatMessage({ id: 'pages.message.k8s.ingress.extra' })}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label={formatMessage('prometheus')}
        name="prometheusURL"
        rules={common.formRules.noRequiredURL}
        extra={intl.formatMessage({ id: 'pages.message.k8s.prometheus.extra' })}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label={formatMessage('registry')}
        name="registryID"
        rules={[{ required: true }]}
        extra={intl.formatMessage({ id: 'pages.message.k8s.registry.extra' })}
      >
        <Select>
          {
            registries?.map((item: SYSTEM.Registry) => <Option key={item.id} value={item.id}>{item.name}</Option>)
          }
        </Select>
      </Form.Item>
      <Form.Item
        label={formatMessage('disabled')}
        name="disabled"
        rules={[{ required: true }]}
        extra={intl.formatMessage({ id: 'pages.message.k8s.disabled.extra' })}
      >
        <Select>
          <Option key="true" value>{intl.formatMessage({ id: 'pages.common.yes' })}</Option>
          <Option key="false" value={false}>{intl.formatMessage({ id: 'pages.common.no' })}</Option>
        </Select>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          {intl.formatMessage({ id: 'pages.common.submit' })}
        </Button>
      </Form.Item>
    </div>
  );
};
