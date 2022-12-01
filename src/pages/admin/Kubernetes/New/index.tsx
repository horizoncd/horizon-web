import {
  Col, Form, Input, Row,
} from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import { history, useIntl } from 'umi';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import { createRegion } from '@/services/regions/regions';
import KubernetesForm from '../Form';

export default () => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const { successAlert } = useModel('alert');

  return (
    <PageWithBreadcrumb>
      <Row>
        <Col offset={6} span={12}>
          <Form
            form={form}
            layout="vertical"
            onFinish={(v) => {
              createRegion(v).then(({ data: id }) => {
                successAlert(intl.formatMessage({ id: 'pages.common.create.success' }));
                history.push(`/admin/kubernetes/${id}`);
              });
            }}
          >
            <Form.Item
              label={intl.formatMessage({ id: 'pages.kubernetes.name' })}
              name="name"
              rules={[{ required: true }]}
              extra={intl.formatMessage({ id: 'pages.message.k8s.name.extra' })}
            >
              <Input />
            </Form.Item>
            <KubernetesForm />
          </Form>
        </Col>
      </Row>
    </PageWithBreadcrumb>
  );
};
