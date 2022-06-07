import {Button, Form, Input} from "antd";

export default () => {
  return <div>
    <Form.Item label={"展示名"} name={'displayName'} rules={[{required: true}]} extra={'系统内部展示名称，一般可填为中文名'}>
      <Input/>
    </Form.Item>
    <Form.Item>
      <Button type="primary" htmlType="submit">
        Submit
      </Button>
    </Form.Item>
  </div>
}
