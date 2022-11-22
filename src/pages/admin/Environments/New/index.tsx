import {
  Col, Form, Input, Row,
} from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import { history, useIntl } from 'umi';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import { createEnvironment } from '@/services/environments/environments';
import EnvForm from '../Form';

export default () => {
  const [form] = Form.useForm();
  const intl = useIntl();
  const { successAlert } = useModel('alert');

  return (
    <PageWithBreadcrumb>
      <Row>
        <Col offset={6} span={12}>
          <Form
            form={form}
            layout="vertical"
            onFinish={(v) => {
              const data: SYSTEM.Environment = {
                ...v,
              };
              createEnvironment(data).then(({ data: id }) => {
                successAlert(intl.formatMessage({ id: 'pages.common.create.success' }));
                history.push(`/admin/environments/${id}`);
              });
            }}
          >
            <Form.Item
              label={intl.formatMessage({ id: 'pages.environment.name' })}
              name="name"
              rules={[{ required: true }]}
              extra={intl.formatMessage({ id: 'pages.message.environment.name.extra' })}
            >
              <Input />
            </Form.Item>
            <EnvForm />
          </Form>
        </Col>
      </Row>
    </PageWithBreadcrumb>
  );
};
