import {
  Button, Form, Input, Select,
} from 'antd';
import { useRequest } from 'umi';
import common from '@/pages/admin/common';
import { getKinds } from '@/services/registries/registries';

const { Option } = Select;

function RegistryForm() {
  const { data: kinds } = useRequest(getKinds);
  return (
    <div>
      <Form.Item label="名称" name="name" rules={[{ required: true }]} extra="Registry唯一名称标识">
        <Input />
      </Form.Item>
      <Form.Item label="URL" name="server" rules={common.formRules.url} extra="Registry访问地址">
        <Input />
      </Form.Item>
      <Form.Item label="Path" name="path" rules={[{ required: true }]} extra="image的统一前缀">
        <Input />
      </Form.Item>
      <Form.Item label="token" name="token" rules={[{ required: true }]} extra="通过API访问Registry所需的token">
        <Input />
      </Form.Item>
      <Form.Item label="跳过证书验证" name="insecureSkipTLSVerify" rules={[{ required: true }]} extra="https请求中，跳过tls证书验证">
        <Select>
          {/* eslint-disable-next-line react/jsx-boolean-value */}
          <Option value={true}>true</Option>
          <Option value={false}>false</Option>
        </Select>
      </Form.Item>
      <Form.Item label="registry类型" name="kind" rules={[{ required: true }]} extra="标识registry的具体类型">
        <Select>
          {
            kinds?.map((kind) => <Option value={kind}>{kind}</Option>)
          }
        </Select>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </div>
  );
}

export default RegistryForm;
