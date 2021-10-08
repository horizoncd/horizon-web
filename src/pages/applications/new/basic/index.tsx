import { Card, Form, Input, Select } from "antd";
import type { Rule } from "rc-field-form/lib/interface";

const { TextArea } = Input;
const { Option } = Select;

export default (props: any) => {
  const [form] = Form.useForm();

  const nameRules: Rule[] = [{
    required: true,
    pattern: new RegExp('^[a-z][a-z0-9-]*$'),
    message: '应用名是必填项，支持字母、数字和中划线的组合，且必须以字母开头'
  }];

  return (
    <div>
      <Form
        layout={ 'vertical' }
        form={ form }
        requiredMark={ false }
      >
        <Card title={ 'Service Basic' }>
          <Form.Item label={ '应用名' } name={ 'name' } rules={ nameRules }>
            <Input placeholder="支持字母、数字或中划线、长度最大为40字符"/>
          </Form.Item>
          <Form.Item label={ '应用描述' } name={ 'description' }>
            <TextArea placeholder="可选，长度上限为255个字符"/>
          </Form.Item>
          <Form.Item label={ '模版版本' } name={ 'templateVersion' }>
            <Select >
              <Option value="jack">Jack</Option>
              <Option value="lucy">Lucy</Option>
            </Select>
          </Form.Item>
        </Card>

        <Card title={ 'Repo' } style={{marginTop: '20px'}}>
          <Form.Item label={ 'RepoName' } name={ 'repoName' }>
            <Input />
          </Form.Item>
          <Form.Item label={ 'defaultBranch' } name={ 'defaultBranch' }>
            <Select >
              <Option value="jack">Jack</Option>
              <Option value="lucy">Lucy</Option>
            </Select>
          </Form.Item>
        </Card>
      </Form>
    </div>
  )
}
