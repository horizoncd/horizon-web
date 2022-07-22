import {Form, Input, Select} from "antd";

const {Option} = Select;

export const TemplateForm = () => {
  return <div>
    <Form.Item label={"描述"} name={'description'} extra={'对template的详细描述'}>
      <Input/>
    </Form.Item>
    <Form.Item label={"仅admin可见"} name={'onlyAdmin'} rules={[{required: true}]} extra={'该template只有admin可见'}>
      <Select>
        <Option key='true' value={true}>是</Option>
        <Option key='false' value={false}>否</Option>
      </Select>
    </Form.Item>
    <Form.Item label={"gitlab仓库"} name={'repository'} rules={[{required: true}]} extra={'template的clone链接，horizon通过链接拉取template'}>
      <Input/>
    </Form.Item>
  </div>
}

export const ReleaseForm = () => {
  return <div>
    <Form.Item label={"描述"} name={'description'} extra={'对release的详细描述'}>
      <Input/>
    </Form.Item>
    <Form.Item label={"仅admin可见"} name={'onlyAdmin'} rules={[{required: true}]} extra={'该template只有admin可见'}>
      <Select>
        <Option key='true' value={true}>是</Option>
        <Option key='false' value={false}>否</Option>
      </Select>
    </Form.Item>
    <Form.Item label={"推荐"} name={'recommended'} rules={[{required: true}]} extra={'是否将当前tag，设为对应template的推荐版本'}>
      <Select>
        <Option key='true' value={true}>是</Option>
        <Option key='false' value={false}>否</Option>
      </Select>
    </Form.Item>
  </div>
}