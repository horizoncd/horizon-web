import {
  Button, Form, Input,
} from 'antd';
import { useIntl } from 'umi';

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
      <Form.Item>
        <Button type="primary" htmlType="submit">
          {intl.formatMessage({ id: 'pages.common.submit' })}
        </Button>
      </Form.Item>
    </div>
  );
};
