import {
  Col, Form, Row, Button,
} from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import { history, useIntl, useRequest } from 'umi';
import { PropsWithChildren } from 'react';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import { ReleaseForm } from '../../Components/Form';
import TagSelector from '../../Components/TagSelector';
import { createRelease, queryTemplate } from '@/services/templates/templates';
import { NotFound } from '@/components/State';
import rbac from '@/rbac';
import { PageWithInitialState } from '@/components/Enhancement';
import { API } from '@/services/typings';

function NewRelease(props: PropsWithChildren<{ initialState: API.InitialState }>) {
  const [form] = Form.useForm();
  const { successAlert } = useModel('alert');
  const intl = useIntl();
  const { initialState: { resource: { id: templateID, fullName } } } = props;
  const { data: template } = useRequest(() => queryTemplate(templateID));
  if (!template) {
    return <NotFound />;
  }

  return (
    <PageWithBreadcrumb>
      <Row>
        <Col offset={6} span={12}>
          <Form
            form={form}
            layout="vertical"
            onFinish={(v) => {
              createRelease(templateID, v).then(() => {
                successAlert(intl.formatMessage({ id: 'pages.message.release.create.success' }));
                history.push(`/templates/${fullName}/-/detail`);
              });
            }}
          >
            <h1>{intl.formatMessage({ id: 'pages.template.newRelease' })}</h1>
            <TagSelector prefix={[]} repository={template.repository} />
            <ReleaseForm prefix={[]} />
            <Form.Item>
              <Button
                type="primary"
                disabled={!rbac.Permissions.createRelease.allowed}
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

export default PageWithInitialState(NewRelease);
