import { Col, Form, Row } from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import { history } from 'umi';
import { createHarbor } from '@/services/harbors/harbors';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import HarborForm from '../Form';

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
              const data: SYSTEM.Harbor = {
                ...v,
                preheatPolicyID: parseInt(v.preheatPolicyID),
              };
              createHarbor(data).then(({ data: id }) => {
                successAlert('Harbor 创建成功');
                history.push(`/admin/harbors/${id}`);
              });
            }}
          >
            <HarborForm />
          </Form>
        </Col>
      </Row>
    </PageWithBreadcrumb>
  );
};
