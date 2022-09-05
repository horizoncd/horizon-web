import {
  Button, Col, Form, Row,
} from 'antd';
import { useParams } from 'umi';
import { useEffect } from 'react';
import { useModel } from '@@/plugin-model/useModel';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';

import FormCommon from '@/pages/oauthapp/Common';
import { get, update } from '@/services/oauthapp/oauthapp';
import ClientPage from '@/pages/oauthapp/ClientIDSecret';
import RBAC from '@/rbac';

export default () => {
  const { refresh } = useModel('@@initialState');
  const { successAlert } = useModel('alert');
  const [form] = Form.useForm();
  const params = useParams<{ id: string }>();
  useEffect(() => {
    const loadDetail = async () => {
      const { data: formData } = await get(params.id);
      form.setFieldsValue(formData);
    };
    loadDetail();
  });

  const onUpdateClick = (values: any) => {
    const appInfo: API.APPBasicInfo = {
      appID: values.id,
      clientID: values.clientID,
      appName: values.appName,
      desc: values.desc,
      homeURL: values.homeURL,
      redirectURL: values.redirectURL,
    };
    update(values.clientID, appInfo).then(() => {
      successAlert(`Oauth App${appInfo.appName} have successful updated`);
      refresh();
    });
  };
  return (
    <PageWithBreadcrumb>
      <Row>
        <Col span={6} />
        <Col span={12}>
          <div>
            <ClientPage />
            <Form
              layout="vertical"
              onFinish={onUpdateClick}
              form={form}
              style={{ marginTop: 50 }}
            >
              <h2> Application Basic</h2>
              <FormCommon />
              <Form.Item>
                <div style={{ textAlign: 'center' }}>
                  <Button
                    type="primary"
                    disabled={!RBAC.Permissions.updateOauthApplication.allowed}
                    htmlType="submit"
                  >
                    Update Application
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </div>
        </Col>
      </Row>
    </PageWithBreadcrumb>
  );
};
