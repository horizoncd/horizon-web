import {
  Col, Form, Input, Row,
} from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import { history } from 'umi';
import { useParams, useIntl } from 'umi';
import { useRequest } from '@@/plugin-request/request';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import NotFound from '@/pages/404';
import { getRegionByID, updateRegionByID } from '@/services/regions/regions';
import KubernetesForm from '@/pages/admin/Kubernetes/Form';

export default () => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const { successAlert } = useModel('alert');
  const params = useParams<{ id: string }>();
  if (!params.id || isNaN(parseInt(params.id, 10))) {
    return <NotFound />;
  }

  const regionID = parseInt(params.id, 10);
  const { data: region } = useRequest(() => getRegionByID(regionID), {
    onSuccess: () => {
      form.setFieldsValue(region);
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
              updateRegionByID(regionID, v).then(() => {
                successAlert(intl.formatMessage({ id: 'pages.common.update.success' }));
                history.push(`/admin/kubernetes/${regionID}`);
              });
            }}
          >
            <Form.Item
              label={intl.formatMessage({ id: 'pages.kubernetes.name' })}
              name="name"
              rules={[{ required: true }]}
              extra={intl.formatMessage({ id: 'pages.message.k8s.name.extra' })}
            >
              <Input disabled />
            </Form.Item>
            <KubernetesForm />
          </Form>
        </Col>
      </Row>
    </PageWithBreadcrumb>
  );
};
