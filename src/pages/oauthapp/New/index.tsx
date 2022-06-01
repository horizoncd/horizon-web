import {Button, Col, Form, Input, Row} from 'antd';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import {Rule} from "rc-field-form/lib/interface";
import {create} from "@/services/oauthapp/oauthapp"
import {useModel} from "@@/plugin-model/useModel";

const {TextArea} = Input;

export default () => {
  const {successAlert} = useModel('alert')
  const {initialState} = useModel('@@initialState');
  const groupID = initialState!.resource.id
  const formatLabel = (labelName: string) => <strong>{labelName}</strong>;
  const appNameLabel = formatLabel('Application Name')
  const appDescLabel = formatLabel('Application Description')
  const appHomeURLLabel = formatLabel('HomePage URL')
  const appRedirectURL = formatLabel('Authorization callback URL')

  const [form] = Form.useForm();

  const onCreateClick = (values: any) => {
    const newOauthApp: API.NewOauthApp = {
      name: values.appName,
      desc: values.desc,
      homeURL: values.homeURL,
      redirectURL: values.redirectURL
    }
    console.log(values);
    create(groupID, newOauthApp).then(() => {
      successAlert("Oauth App" + newOauthApp.name + "have successful created")
      history.back()
    })
  }

  const urlRegx = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi)
  const nameRules: Rule[] = [
    {
      required: true,
      max: 64,
      message: 'name required, max length: 64',
    },
  ];

  const URLRules: Rule[] = [
    {
      required: true,
      pattern: urlRegx,
      message: 'URL是必填项，只支持小写字母、数字和中划线的组合，且必须以字母开头',
    },
  ];

  const tailLayout = {
    wrapperCol: {offset: 8, span: 16},
  };

  const onReset = () => {
    form.resetFields();
  };

  return (
    <PageWithBreadcrumb>
      <Row>
        <Col span={8}/>
        <Col span={8}>
          <div><h2>Create oauth app</h2></div>
          <Form
            layout={'vertical'}
            onFinish={onCreateClick}
            form={form}
            style={{marginTop: 10}}
          >
            <Form.Item
              label={appNameLabel}
              name="appName"
              rules={nameRules}
              extra={<span style={{color: "black"}}>Something users will recognize and trust.</span>}>
              <Input
              />
            </Form.Item>
            <Form.Item
              label={appHomeURLLabel}
              rules={URLRules}
              name="homeURL"
              extra={<span style={{color: "black"}}>The full URL to your application homepage.</span>}
            >
              <Input
              />
            </Form.Item>
            <Form.Item
              label={appDescLabel}
              name="desc"
              extra={<span style={{color: "black"}}>This is displayed to all users of your application.</span>}>
              <TextArea
                allowClear autoSize={{minRows: 3}} maxLength={255}
              />
            </Form.Item>
            <Form.Item
              label={appRedirectURL}
              name="redirectURL"
              rules={URLRules}
              extra={<span style={{color: "black"}}>Your application’s callback URL.</span>}>
              <Input
              />
            </Form.Item>
            <Form.Item {...tailLayout}>
              <Button type="primary" htmlType="submit">
                Submit
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
