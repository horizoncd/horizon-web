import {
  Col, Form, Input, Row, Button, Select,
} from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import { history } from 'umi';
import { PropsWithChildren, useState } from 'react';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import { TemplateForm, ReleaseForm } from '../Components/Form';
import { createTemplate } from '@/services/templates/templates';
import TagSelector from '../Components/TagSelector';
import { NotFount } from '@/components/State';
import rbac from '@/rbac';

const Release = (props: PropsWithChildren<{ repository: any }>) => {
  const { repository } = props;

  return (
    <>
      {
    typeof repository === 'string' && repository !== ''
      ? <TagSelector prefix={['release']} repository={repository} />
      : (
        <Form.Item
          label="版本"
          name={['release', 'name']}
          required
          rules={[{ required: true }]}
          extra="release对应template的版本"
        >
          <Select />
        </Form.Item>
      )

        }
      <ReleaseForm prefix={['release']} />
    </>
  );
};

export const TemplateCreatePage = () => {
  const [form] = Form.useForm();
  const { successAlert } = useModel('alert');
  const [repo, setRepo] = useState('');

  const { initialState } = useModel('@@initialState');
  if (!initialState || !initialState.currentUser) {
    return <NotFount />;
  }

  const { isAdmin } = initialState.currentUser;
  let groupID = 0;
  if (history.location.pathname !== '/templates/new') {
    groupID = initialState?.resource.id;
  }
  const fullName = initialState?.resource.fullName;

  const pattern = /^(?:http(?:s?)|ssh):\/\/.+?\/(.+?)(?:.git)?$/;

  const updateRepo = (s: string) => {
    if (pattern.test(s)) {
      setRepo(s);
    }
  };

  return (
    <PageWithBreadcrumb>
      <Row>
        <Col offset={6} span={12}>
          <Form
            form={form}
            layout="vertical"
            onFinish={(v) => {
              createTemplate(groupID, v).then(({ data: { name } }) => {
                successAlert('Template 创建成功');
                if (fullName === '') {
                  window.location.href = (`/templates/${name}/-/detail`);
                } else {
                  window.location.href = `/templates/${fullName}/${name}/-/detail`;
                }
              });
            }}
          >
            <h2>创建Template</h2>
            <Form.Item
              label="名称"
              name="name"
              required
              rules={[{ required: true }]}
              extra="Templates唯一名称标识"
            >
              <Input />
            </Form.Item>
            <TemplateForm onRepositoryBlur={updateRepo} />

            <h2>创建Release</h2>
            <Release repository={repo} />

            <Form.Item>
              <Button
                type="primary"
                disabled={!isAdmin && !rbac.Permissions.createTemplate.allowed}
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
};

export default TemplateCreatePage;
