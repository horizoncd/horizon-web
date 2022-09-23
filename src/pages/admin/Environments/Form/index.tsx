import {
  Button, Form, Input, Select,
} from 'antd';

const { Option } = Select;

export default () => (
  <div>
    <Form.Item label="展示名" name="displayName" rules={[{ required: true }]} extra="系统内部展示名称，一般可填为中文名">
      <Input />
    </Form.Item>
    <Form.Item label="自动释放" name="autoFree" rules={[{ required: true }]} extra="开启后，系统会在指定过期时间后自动释放该环境下的集群">
      <Select defaultValue={false}>
        <Option key="true" value>开启</Option>
        <Option key="false" value={false}>关闭</Option>
      </Select>
    </Form.Item>
    <Form.Item>
      <Button type="primary" htmlType="submit">
        Submit
      </Button>
    </Form.Item>
  </div>
);
