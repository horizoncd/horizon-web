import { Col, Divider, Row, Form, Button, Input, Space, Radio } from 'antd';
import { history } from 'umi';
import './index.less'
import { Rule } from 'rc-field-form/lib/interface'

const { TextArea } = Input;

export default () => {

  const [form] = Form.useForm();

  const formatLabel = (labelName: string) => (
    <strong>
      {labelName}
    </strong>
  );

  const groupNameLabel = formatLabel("Group name");
  const groupPathLabel = formatLabel("Group URL");
  const groupDescLabel = formatLabel("Group description (optional)");
  const groupVisibility = formatLabel("Visibility level");

  const getURLPrefix = () => "http://horizon.netease.com/"
  const getGroupNameLabelStyle = () => {
    return {
      width: '30%'
    }
  }
  const getGroupPathAndDescStyle = () => {
    return {
      width: '60%'
    }
  }
  const getSubmitBtnStyle = () => {
    return {
      width: '80%'
    }
  }

  const cancel = () => history.goBack();

  const onFinish = (values) => {
    console.log(values)
  }

  const nameRules: Rule[] = [{
    required: true,
    message: 'Group name是必填项，请输入'
  }];

  const pathRules: Rule[] = [{
    required: true,
    pattern: new RegExp('[a-z][a-z0-9\\-]*'),
    message: 'URL是必填项，只支持小写字母、数字和中划线的组合，且必须以字母开头'
  }];

  return (
    <Row>
      <Col span={4} />
      <Col span={16}>
        <h1>New group</h1>
        <Divider />
        <Row>
          <Col span={4}>
            <h3>
              Groups allow you to manage and collaborate across multiple projects. Members of a group have access to all of its projects.
            </h3>
          </Col>
          <Col span={2} />
          <Col span={18}>
            <Form
              layout={'vertical'}
              form={form}
              onFinish={onFinish}
              requiredMark={false}
            >
              <Form.Item label={groupNameLabel} name={'groupName'} rules={nameRules}>
                <Input style={getGroupNameLabelStyle()} placeholder="My awesome group"/>
              </Form.Item>
              <Form.Item label={groupPathLabel}  name={'groupPath'} rules={pathRules}>
                <Input addonBefore={getURLPrefix()} style={getGroupPathAndDescStyle()} placeholder="my-awesome-group"/>
              </Form.Item>
              <Form.Item label={groupDescLabel}  name={'groupDesc'}>
                <TextArea style={getGroupPathAndDescStyle()} allowClear/>
              </Form.Item>
              <Form.Item label={groupVisibility} name={'groupVisibility'}>
                <Radio.Group defaultValue={0}>
                  <Space direction="vertical">
                    <Radio value={0}>
                      <div>Public</div>
                      <div>The group and any internal projects can be viewed by any logged in user</div>
                    </Radio>
                    <Radio value={1}>
                      <div>Private</div>
                      <div>The group and its projects can only be viewed by members</div>
                    </Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
              <Form.Item style={getSubmitBtnStyle()}>
                <div className={'form-actions'}>
                  <Button type="primary" htmlType={'submit'}>Create group</Button>
                  <Button style={{float: 'right'}} onClick={cancel}>Cancel</Button>
                </div>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Col>
      <Col span={4} />
    </Row>
  );
};
