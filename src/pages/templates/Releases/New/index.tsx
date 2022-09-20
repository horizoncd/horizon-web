import {
  Col, Form, Row, Button,
} from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import { history, useRequest } from 'umi';
import { PropsWithChildren } from 'react';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import { ReleaseForm } from '../../Components/Form';
import TagSelector from '../../Components/TagSelector';
import { createRelease, queryTemplate } from '@/services/templates/templates';
import { NotFount } from '@/components/State';
import rbac from '@/rbac';
import PageWithInitialState from '@/components/PageWithInitialState/PageWithInitialState';
import { API } from '@/services/typings';

function NewRelease(props: PropsWithChildren<{ initialState: API.InitialState }>) {
  const [form] = Form.useForm();
  const { successAlert } = useModel('alert');
  const { initialState: { resource: { id: templateID, fullName } } } = props;
  const { data: template } = useRequest(() => queryTemplate(templateID));
  if (!template) {
    return <NotFount />;
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
                successAlert('Release 创建成功');
                history.push(`/templates/${fullName}/-/detail`);
              });
            }}
          >
            <h1>创建Release</h1>
            <TagSelector prefix={[]} repository={template.repository} />
            <ReleaseForm prefix={[]} />
            <Form.Item>
              <Button
                type="primary"
                disabled={!rbac.Permissions.createRelease.allowed}
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

export default PageWithInitialState(NewRelease);
