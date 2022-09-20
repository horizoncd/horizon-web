import {
  Button, Col, Form, Row,
} from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import FormCommon from '@/pages/oauthapp/Common';

import { create } from '@/services/oauthapp/oauthapp';

export default () => {
  const { successAlert } = useModel('alert');
  const { initialState } = useModel('@@initialState');
  const groupID = initialState!.resource.id;

  const [form] = Form.useForm();

  const onCreateClick = (values: any) => {
    const newOauthApp: API.NewOauthApp = {
      name: values.appName,
      desc: values.desc,
      homeURL: values.homeURL,
      redirectURL: values.redirectURL,
    };
    create(groupID, newOauthApp).then(() => {
      successAlert(`Oauth App${newOauthApp.name}have successful created`);
      history.back();
    });
  };

  const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  };

  const onReset = () => {
    form.resetFields();
  };

  return (
    <PageWithBreadcrumb>
      <Row>
        <Col span={8} />
        <Col span={8}>
          <div><h2>Create oauth app</h2></div>
          <Form
            layout="vertical"
            onFinish={onCreateClick}
            form={form}
            style={{ marginTop: 10 }}
          >
            <FormCommon />
            <Form.Item {...tailLayout}>
              <Button type="primary" htmlType="submit">
                Create
              </Button>
              <Button htmlType="button" onClick={onReset}>
                Reset
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </PageWithBreadcrumb>
  );
};
