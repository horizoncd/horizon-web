import { Col, Form, Row } from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import { history } from 'umi';
import { createRegistry } from '@/services/registries/registries';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import RegistryForm from '../Form';

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
              const data: SYSTEM.Registry = {
                ...v,
                preheatPolicyID: parseInt(v.preheatPolicyID, 10),
              };
              createRegistry(data).then(({ data: id }) => {
                successAlert('Registry 创建成功');
                history.push(`/admin/registries/${id}`);
              });
            }}
          >
            <RegistryForm />
          </Form>
        </Col>
      </Row>
    </PageWithBreadcrumb>
  );
};
