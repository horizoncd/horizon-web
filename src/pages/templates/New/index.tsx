import {
  Col, Form, Input, Row, Button, Select,
} from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import { history, useIntl } from 'umi';
import { PropsWithChildren, useState } from 'react';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import { TemplateForm, ReleaseForm } from '../Components/Form';
import { createTemplate } from '@/services/templates/templates';
import TagSelector from '../Components/TagSelector';
import { NotFound } from '@/components/State';
import rbac from '@/rbac';

const Release = (props: PropsWithChildren<{ repository: any }>) => {
  const { repository } = props;
  const intl = useIntl();

  return (
    <>
      {
    typeof repository === 'string' && repository !== ''
      ? <TagSelector prefix={['release']} repository={repository} />
      : (
        <Form.Item
          label={intl.formatMessage({ id: 'pages.template.release' })}
          name={['release', 'name']}
          required
          rules={[{ required: true }]}
          extra={intl.formatMessage({ id: 'pages.message.release.extra' })}
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
  const intl = useIntl();

  const { initialState } = useModel('@@initialState');
  if (!initialState || !initialState.currentUser) {
    return <NotFound />;
  }

  const { isAdmin } = initialState.currentUser;
  let groupID = 0;
  let fullName = '';
  if (history.location.pathname !== '/templates/new') {
    groupID = initialState?.resource.id;
    fullName = initialState?.resource.fullName;
  }

  const pattern = /^(?:http(?:s?)|ssh):\/\/.+?\/(.+?)(?:.git)?$/;

  const updateRepo = (s: string) => {
    if (pattern.test(s)) {
      setRepo(s);
    }
  };

  const formatMessage = (suffix: string) => intl.formatMessage({ id: `pages.template.${suffix}` });

  return (
    <PageWithBreadcrumb>
      <Row>
        <Col offset={6} span={12}>
          <Form
            form={form}
            layout="vertical"
            onFinish={(v) => {
              createTemplate(groupID, v).then(({ data: { name } }) => {
                successAlert(intl.formatMessage({ id: 'pages.message.template.create.success' }));
                if (fullName === '') {
                  window.location.href = (`/templates/${name}/-/detail`);
                } else {
                  window.location.href = `/templates/${fullName}/${name}/-/detail`;
                }
              });
            }}
          >
            <h2>{formatMessage('new')}</h2>
            <Form.Item
              label={formatMessage('name')}
              name="name"
              required
              rules={[{ required: true }]}
              extra={intl.formatMessage({ id: 'pages.message.template.name.hint' })}
            >
              <Input />
            </Form.Item>
            <TemplateForm onRepositoryBlur={updateRepo} />

            <h2>{formatMessage('newRelease')}</h2>
            <Release repository={repo} />

            <Form.Item>
              <Button
                type="primary"
                disabled={!isAdmin && !rbac.Permissions.createTemplate.allowed}
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
};

export default TemplateCreatePage;
