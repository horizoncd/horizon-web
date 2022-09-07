import {
  Form, Input, Select, Switch,
} from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import { useState } from 'react';
import { Rule } from 'antd/lib/form';
import { ValidateErrorEntity } from 'rc-field-form/lib/interface';
import { useRequest } from 'umi';
import DropdownSwitch from '@/components/Widget/DropdownSwitch';
import { HttpLink } from '@/validation';
import { fetchDiscovery } from '@/services/idps';

const { Item } = Form;
const { Option } = Select;

const optionalHttp: Rule[] = [
  { type: 'regexp' },
  { pattern: HttpLink },
];

const required: Rule[] = [
  { required: true },
];

const requiredHttp: Rule[] = [
  { required: true },
  ...optionalHttp,
];

const DiscoveryForm = (props: { form: FormInstance }) => {
  const { form } = props;
  const [withDiscovery, setWithDiscovery] = useState(true);
  const [showMeta, setShowMeta] = useState(false);
  const { run } = useRequest(
    fetchDiscovery,
    {
      manual: true,
      onSuccess: (data: any) => {
        form.setFieldsValue(data);
      },
    },
  );

  return (
    <>
      <Item
        label="使用discovery"
        required
      >
        <Switch defaultChecked onChange={(checked) => { setWithDiscovery(checked); }} />
      </Item>
      {withDiscovery && (
      <Item
        hidden={!withDiscovery}
        label="discovery"
        name="discovery"
        required
        rules={requiredHttp}
      >
        <Input onBlur={() => { const discoveryEndpoint = form.getFieldValue('discovery'); if (HttpLink.test(discoveryEndpoint))run(discoveryEndpoint); }} />
      </Item>
      )}
      {
    withDiscovery && (
    <Item>
      <DropdownSwitch
        defaultOpened={showMeta}
        onChange={(show) => { setShowMeta(show); }}
      >
        Show Metadata
      </DropdownSwitch>
    </Item>
    )
  }
      <Item
        hidden={withDiscovery && !showMeta}
        label="Authorization URL"
        name="authorizationEndpoint"
        required
        rules={requiredHttp}
      >
        <Input />
      </Item>
      <Item
        hidden={withDiscovery && !showMeta}
        label="Token URL"
        name="tokenEndpoint"
        required
        rules={requiredHttp}
      >
        <Input />
      </Item>
      <Item
        hidden={withDiscovery && !showMeta}
        label="UserInfo URL"
        name="userinfoEndpoint"
        rules={optionalHttp}
      >
        <Input />
      </Item>
      <Item
        hidden={withDiscovery && !showMeta}
        label="Logout URL"
        name="revocationEndpoint"
        rules={optionalHttp}
      >
        <Input />
      </Item>
      <Item
        hidden={withDiscovery && !showMeta}
        label="Issuer"
        name="issuer"
        required
        rules={requiredHttp}
      >
        <Input />
      </Item>

    </>
  );
};

const IDPForm = (props: {
  form: FormInstance,
  onFinish: (values: any) => void,
  onFinishFailed: (errorInfo: ValidateErrorEntity) => void;
}) => {
  const { form, onFinish, onFinishFailed } = props;

  return (
    <Form
      form={form}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      layout="vertical"
    >
      <Item
        label="名称"
        extra="idp的唯一标识"
        name="name"
        required
        rules={required}
      >
        <Input />
      </Item>
      <Item
        label="展示名"
        name="displayName"
        extra="Horizon向用户展示的名称，一般可填中文名"
        required
        rules={required}
      >
        <Input />
      </Item>

      <DiscoveryForm form={form} />

      <Item
        label="Client authentication"
        name="tokenEndpointAuthMethod"
        initialValue="client_secret_sent_as_post"
      >
        <Select>
          <Option value="client_secret_sent_as_post">
            Client Secret Sent As Post
          </Option>
          <Option value="client_secret_sent_as_basic_auth">
            Client Secret Sent As Basic Auth
          </Option>
          <Option value="client_secret_as_jwt">
            Client Secret As Jwt
          </Option>
          <Option value="jwt_signed_with_private_key">
            Jwt Signed With Private Key
          </Option>
        </Select>
      </Item>
      <Item
        label="Client ID"
        name="clientID"
        required
        rules={required}
      >
        <Input />
      </Item>
      <Item
        label="Client Secret"
        name="clientSecret"
        required
        rules={required}
      >
        <Input type="password" />
      </Item>
      <Item
        label="Scopes"
        name="scopes"
        extra="由空格分割的oidc scopes"
        required
        rules={required}
      >
        <Input />
      </Item>
    </Form>
  );
};

export default IDPForm;
