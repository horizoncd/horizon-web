import {
  Col, Form, Input, Row,
} from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import { history, useParams, useIntl } from 'umi';
import { useRequest } from '@@/plugin-request/request';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import NotFound from '@/pages/404';
import { getEnvironmentByID, updateEnvironmentByID } from '@/services/environments/environments';
import EnvForm from '@/pages/admin/Environments/Form';

export default () => {
  const [form] = Form.useForm();
  const intl = useIntl();
  const { successAlert } = useModel('alert');
  const params = useParams<{ id: string }>();
  if (!params.id || isNaN(parseInt(params.id, 10))) {
    return <NotFound />;
  }

  const environmentID = parseInt(params.id, 10);
  const { data: environment } = useRequest(() => getEnvironmentByID(environmentID), {
    onSuccess: () => {
      form.setFieldsValue(environment);
    },
  });

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
              updateEnvironmentByID(environmentID, data).then(() => {
                successAlert(intl.formatMessage({ id: 'pages.common.edit.success' }));
                history.push(`/admin/environments/${environmentID}`);
              });
            }}
          >
            <Form.Item
              label={intl.formatMessage({ id: 'pages.environment.name' })}
              name="name"
              rules={[{ required: true }]}
              extra={intl.formatMessage({ id: 'pages.message.environment.name.extra' })}
            >
              <Input disabled />
            </Form.Item>
            <EnvForm />
          </Form>
        </Col>
      </Row>
    </PageWithBreadcrumb>
  );
};
