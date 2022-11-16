import {
  Button, Col, Form, Input, Row,
} from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import { history } from 'umi';
import { useRequest } from '@@/plugin-request/request';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import { getRelease, updateRelease } from '@/services/templates/templates';
import { ReleaseForm } from '../../Components/Form';
import rbac from '@/rbac';
import { API } from '@/services/typings';
import { PageWithInitialState } from '@/components/Enhancement';

function EditRelease(props: { initialState: API.InitialState }) {
  const [form] = Form.useForm();
  const { successAlert } = useModel('alert');

  const { initialState: { resource: { id: releaseID, fullName } } } = props;
  const { data: release } = useRequest(() => getRelease(releaseID), {
    onSuccess: () => {
      form.setFieldsValue(release);
    },
  });

  const [, templatePath, releasePath] = /(.*)\/(.*?)$/.exec(fullName)!;

  return (
    <PageWithBreadcrumb>
      <Row>
        <Col offset={6} span={12}>
          <Form
            form={form}
            layout="vertical"
            onFinish={(v) => {
              updateRelease(releaseID, v).then(() => {
                successAlert('Release 更新成功');
                history.push(`/templates/${templatePath}/-/releases/${releasePath}`);
              });
            }}
          >
            <Form.Item label="版本" name="name" required extra="release对应的tag">
              <Input disabled />
            </Form.Item>
            <ReleaseForm prefix={[]} />
            <Form.Item>
              <Button
                type="primary"
                disabled={!rbac.Permissions.updateRelease.allowed}
                htmlType="submit"
              >
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </PageWithBreadcrumb>
  );
}

export default PageWithInitialState(EditRelease);
