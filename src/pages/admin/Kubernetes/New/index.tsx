import {
  Col, Form, Input, Row,
} from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import { history } from 'umi';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import { createRegion } from '@/services/regions/regions';
import KubernetesForm from '../Form';

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
              createRegion(v).then(({ data: id }) => {
                successAlert('Kubernetes 创建成功');
                history.push(`/admin/kubernetes/${id}`);
              });
            }}
          >
            <Form.Item label="名称" name="name" rules={[{ required: true }]} extra="Kubernetes唯一名称标识">
              <Input />
            </Form.Item>
            <KubernetesForm />
          </Form>
        </Col>
      </Row>
    </PageWithBreadcrumb>
  );
};
