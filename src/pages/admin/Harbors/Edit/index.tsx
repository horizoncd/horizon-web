import { Col, Form, Row } from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import { history, useParams } from 'umi';
import { useRequest } from '@@/plugin-request/request';
import { getHarborByID, updateHarborByID } from '@/services/harbors/harbors';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import NotFount from '@/pages/404';
import HarborForm from '@/pages/admin/Harbors/Form';

export default () => {
  const [form] = Form.useForm();
  const { successAlert } = useModel('alert');
  const params = useParams<{ id: string }>();
  if (!params.id || isNaN(parseInt(params.id))) {
    return <NotFount />;
  }

  const harborID = parseInt(params.id);
  const { data: harbor } = useRequest(() => getHarborByID(harborID), {
    onSuccess: () => {
      form.setFieldsValue(harbor);
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
              const data: SYSTEM.Harbor = {
                ...v,
                preheatPolicyID: parseInt(v.preheatPolicyID),
              };
              updateHarborByID(harborID, data).then(() => {
                successAlert('Harbor 编辑成功');
                history.push(`/admin/harbors/${harborID}`);
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
