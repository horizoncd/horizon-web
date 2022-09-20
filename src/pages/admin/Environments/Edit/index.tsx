import {
  Col, Form, Input, Row,
} from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import { history, useParams } from 'umi';
import { useRequest } from '@@/plugin-request/request';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import NotFount from '@/pages/404';
import { getEnvironmentByID, updateEnvironmentByID } from '@/services/environments/environments';
import EnvForm from '@/pages/admin/Environments/Form';

export default () => {
  const [form] = Form.useForm();
  const { successAlert } = useModel('alert');
  const params = useParams<{ id: string }>();
  if (!params.id || isNaN(parseInt(params.id))) {
    return <NotFount />;
  }

  const environmentID = parseInt(params.id);
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
                successAlert('环境 编辑成功');
                history.push(`/admin/environments/${environmentID}`);
              });
            }}
          >
            <Form.Item label="名称" name="name" rules={[{ required: true }]} extra="环境唯一名称标识">
              <Input disabled />
            </Form.Item>
            <EnvForm />
          </Form>
        </Col>
      </Row>
    </PageWithBreadcrumb>
  );
};
