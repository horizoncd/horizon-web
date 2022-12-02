import { Col, Form, Row } from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import { history, useParams, useIntl } from 'umi';
import { useRequest } from '@@/plugin-request/request';
import { getRegistryByID, updateRegistryByID } from '@/services/registries/registries';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import NotFound from '@/pages/404';
import RegistryForm from '@/pages/admin/Registries/Form';

export default () => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const { successAlert } = useModel('alert');
  const params = useParams<{ id: string }>();
  if (!params.id || Number.isNaN(parseInt(params.id, 10))) {
    return <NotFound />;
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
                successAlert(intl.formatMessage({ id: 'pages.common.edit.success' }));
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
