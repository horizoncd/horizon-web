import {
  Button, Col, Form, Input, Row,
} from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import { history, useIntl } from 'umi';
import { useRequest } from '@@/plugin-request/request';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import { queryTemplate, updateTemplate } from '@/services/templates/templates';
import { TemplateForm } from '../Components/Form';
import rbac from '@/rbac';
import { PageWithInitialState } from '@/components/Enhancement';

function TemplateEdit(props: { initialState: API.InitialState }) {
  const [form] = Form.useForm();
  const intl = useIntl();
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
                successAlert(intl.formatMessage({ id: 'pages.message.template.update.success' }));
                history.push(`/templates/${fullName}/-/detail`);
              });
            }}
          >
            <Form.Item
              label={intl.formatMessage({ id: 'pages.template.name' })}
              name="name"
              required
              rules={[{ required: true }]}
              extra={intl.formatMessage({ id: 'pages.message.template.name.hint' })}
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
                {intl.formatMessage({ id: 'pages.common.submit' })}
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </PageWithBreadcrumb>
  );
}

export default PageWithInitialState(TemplateEdit);
