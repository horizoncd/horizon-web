import {
  Button, Form, Input, Select,
} from 'antd';
import { useIntl } from 'umi';

const { Option } = Select;

export default () => {
  const intl = useIntl();
  return (
    <div>
      <Form.Item
        label={intl.formatMessage({ id: 'pages.environment.displayName' })}
        name="displayName"
        rules={[{ required: true }]}
        extra={intl.formatMessage({ id: 'pages.message.environment.displayName.extra' })}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label={intl.formatMessage({ id: 'pages.environment.autoFree' })}
        name="autoFree"
        rules={[{ required: true }]}
        extra={intl.formatMessage({ id: 'pages.message.environment.autoFree.extra' })}
        initialValue={false}
      >
        <Select>
          <Option key="true" value>{intl.formatMessage({ id: 'pages.environment.autoFree.on' })}</Option>
          <Option key="false" value={false}>{intl.formatMessage({ id: 'pages.environment.autoFree.off' })}</Option>
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
