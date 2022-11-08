import { Col, Form, Row } from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import { history, useParams } from 'umi';
import { useRequest } from '@@/plugin-request/request';
import { getRegistryByID, updateRegistryByID } from '@/services/registries/registries';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import NotFount from '@/pages/404';
import RegistryForm from '@/pages/admin/Registries/Form';

export default () => {
  const [form] = Form.useForm();
  const { successAlert } = useModel('alert');
  const params = useParams<{ id: string }>();
  if (!params.id || Number.isNaN(parseInt(params.id, 10))) {
    return <NotFount />;
  }

  const registryID = parseInt(params.id, 10);
  const { data: registry } = useRequest(() => getRegistryByID(registryID), {
    onSuccess: () => {
      form.setFieldsValue(registry);
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
              const data: SYSTEM.Registry = {
                ...v,
                preheatPolicyID: parseInt(v.preheatPolicyID, 10),
              };
              updateRegistryByID(registryID, data).then(() => {
                successAlert('Registry 编辑成功');
                history.push(`/admin/registries/${registryID}`);
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
