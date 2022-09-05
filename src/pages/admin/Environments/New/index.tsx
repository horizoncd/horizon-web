import {
  Col, Form, Input, Row,
} from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import { history } from 'umi';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import { createEnvironment } from '@/services/environments/environments';
import EnvForm from '../Form';

export default () => {
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
              const data: SYSTEM.Environment = {
                ...v,
              };
              createEnvironment(data).then(({ data: id }) => {
                successAlert('环境 创建成功');
                history.push(`/admin/environments/${id}`);
              });
            }}
          >
            <Form.Item label="名称" name="name" rules={[{ required: true }]} extra="环境唯一名称标识">
              <Input />
            </Form.Item>
            <EnvForm />
          </Form>
        </Col>
      </Row>
    </PageWithBreadcrumb>
  );
};
