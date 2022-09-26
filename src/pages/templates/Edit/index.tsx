import {
  Button, Col, Form, Input, Row,
} from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import { history } from 'umi';
import { useRequest } from '@@/plugin-request/request';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import { queryTemplate, updateTemplate } from '@/services/templates/templates';
import { TemplateForm } from '../Components/Form';
import rbac from '@/rbac';
import PageWithInitialState from '@/components/PageWithInitialState/PageWithInitialState';
import { API } from '@/services/typings';

function TemplateEdit(props: { initialState: API.InitialState }) {
  const [form] = Form.useForm();
  const { successAlert } = useModel('alert');

  const { initialState: { resource: { id: templateID, fullName } } } = props;

  const { data: template } = useRequest(() => queryTemplate(templateID, true), {
    onSuccess: () => {
      form.setFieldsValue(template);
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
              updateTemplate(templateID, v).then(() => {
                successAlert('更新成功');
                history.push(`/templates/${fullName}/-/detail`);
              });
            }}
          >
            <Form.Item
              label="名称"
              name="name"
              required
              rules={[{ required: true }]}
              extra="Templates唯一名称标识"
            >
              <Input disabled />
            </Form.Item>
            <TemplateForm
              editRepository={template !== undefined && (template.releases === undefined || template.releases.length === 0)}
              onRepositoryBlur={() => {}}
            />
            <Form.Item>
              <Button
                type="primary"
                disabled={!rbac.Permissions.updateTemplate.allowed}
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

export default PageWithInitialState(TemplateEdit);
