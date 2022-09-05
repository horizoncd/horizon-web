import { Form, Input, Select } from 'antd';

const { Option } = Select;

export const TemplateForm = (props: { onRepositoryBlur: (s: string) => void, isAdmin: boolean }) => (
  <div>
    <Form.Item label="描述" name="description" extra="对template的详细描述">
      <Input />
    </Form.Item>
    {
      props.isAdmin ? (
        <Form.Item label="仅admin可见" name="onlyAdmin" required extra="该template只有admin可见">
          <Select>
            <Option key="true" value>是</Option>
            <Option key="false" value={false}>否</Option>
          </Select>
        </Form.Item>
      )
        : <></>
    }
    <Form.Item
      label="gitlab仓库"
      name="repository"
      rules={[
        {
          required: true,
        },
        {
          type: 'regexp',
          warningOnly: true,
        },
        {
          pattern: new RegExp('^(?:http(?:s?)|ssh)://.+?/(.+?)(?:.git)?$'),
          message: '不是正确的gitlab链接格式',
        },
      ]}
      extra="template的clone链接，horizon通过链接拉取template"
    >
      <Input onBlur={(i) => props.onRepositoryBlur(i.target.value)} />
    </Form.Item>
  </div>
);

export const ReleaseForm = (props: { prefix: string[], isAdmin: boolean }) => {
  const calculateName = (name: string) => {
    if (props.prefix.length === 0) {
      return name;
    }
    return [...props.prefix, name];
  };
  return (
    <div>
      <Form.Item label="描述" name={calculateName('description')} extra="对release的详细描述">
        <Input />
      </Form.Item>
      {
      props.isAdmin
        ? (
          <Form.Item label="仅admin可见" name={calculateName('onlyAdmin')} rules={[{ required: true }]} extra="该release只有admin可见">
            <Select>
              <Option key="true" value>是</Option>
              <Option key="false" value={false}>否</Option>
            </Select>
          </Form.Item>
        )
        : <></>
    }
      <Form.Item label="推荐" name={calculateName('recommended')} rules={[{ required: true }]} extra="是否将当前tag，设为对应template的推荐版本">
        <Select>
          <Option key="true" value>是</Option>
          <Option key="false" value={false}>否</Option>
        </Select>
      </Form.Item>
    </div>
  );
};
