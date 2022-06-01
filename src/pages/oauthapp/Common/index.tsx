import {Form, Input} from "antd";
import {Rule} from "rc-field-form/lib/interface";

export default () => {
  const formatLabel = (labelName: string) => <strong>{labelName}</strong>;
  const appNameLabel = formatLabel('Application Name')
  const appDescLabel = formatLabel('Application Description')
  const appHomeURLLabel = formatLabel('HomePage URL')
  const appRedirectURL = formatLabel('Authorization callback URL')

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

  return (
  <div>
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
  </div>
);

}
