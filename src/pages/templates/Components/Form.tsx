import { Form, Input, Select } from 'antd';

const { Option } = Select;
const { TextArea } = Input;

const DescriptionInput = () => <TextArea autoSize={{ minRows: 2, maxRows: 6 }} />;

export const TemplateForm = (props: { editRepository?: boolean, onRepositoryBlur: (s: string) => void }) => {
  const { onRepositoryBlur } = props;
  const { editRepository } = props;
  return (
    <div>
      <Form.Item label="描述" name="description" extra="对template的详细描述">
        <DescriptionInput />
      </Form.Item>
      <Form.Item
        label="仅Owner可见"
        name="onlyOwner"
        required
        rules={[{ required: true }]}
        extra="该template只有Owner可见"
      >
        <Select>
          <Option key="true" value>是</Option>
          <Option key="false" value={false}>否</Option>
        </Select>
      </Form.Item>
      <Form.Item
        label="gitlab仓库"
        name="repository"
        required
        rules={[
          {
            required: true,
          },
          {
            type: 'regexp',
            warningOnly: true,
          },
          {
            pattern: /^(?:http(?:s?)|ssh):\/\/.+?\/(.+?)(?:.git)?$/,
            message: '不是正确的gitlab链接格式',
          },
        ]}
        extra={!editRepository
          ? '\n不能修改仓库地址，因为该template还存在Release'
          : 'template的clone链接，horizon通过链接拉取template'}
      >
        <Input
          disabled={!editRepository}
          onBlur={(i) => onRepositoryBlur(i.target.value)}
        />
      </Form.Item>
      <Form.Item
        label="CI情况"
        name="withoutCI"
        required
        rules={[{ required: true }]}
        extra="模板包含的CI情况"
        // eslint-disable-next-line react/jsx-boolean-value
        initialValue={true}
      >
        <Select>
          {/*eslint-disable-next-line react/jsx-boolean-value*/}
          <Option key="true" value={true}>不包含CI</Option>
          <Option key="false" value={false}>包含CI</Option>
        </Select>
      </Form.Item>
    </div>
  );
};

TemplateForm.defaultProps = {
  editRepository: true,
};

export const ReleaseForm = (props: { prefix: string[] }) => {
  const { prefix } = props;

  const calculateName = (name: string) => {
    if (prefix.length === 0) {
      return name;
    }
    return [...prefix, name];
  };
  return (
    <div>
      <Form.Item label="描述" name={calculateName('description')} extra="对release的详细描述">
        <DescriptionInput />
      </Form.Item>
      <Form.Item
        label="仅Owner可见"
        name={calculateName('onlyOwner')}
        required
        initialValue={false}
        rules={[{ required: true }]}
        extra="该release只有Owner可见"
      >
        <Select>
          <Option key="true" value>是</Option>
          <Option key="false" value={false}>否</Option>
        </Select>
      </Form.Item>
      <Form.Item
        label="推荐"
        name={calculateName('recommended')}
        required
        rules={[{ required: true }]}
        initialValue={false}
        extra="是否将当前tag，设为对应template的推荐版本"
      >
        <Select>
          <Option key="true" value>是</Option>
          <Option key="false" value={false}>否</Option>
        </Select>
      </Form.Item>
    </div>
  );
};
