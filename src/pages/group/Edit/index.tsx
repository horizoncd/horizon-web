import { Col, Divider, Row, Form, Button, Input, Space, Radio } from 'antd';
import { Rule } from 'rc-field-form/lib/interface'
import './index.less'

const { TextArea } = Input;

export default (props: any) => {
  const [form] = Form.useForm();

  const parentId = props.location.query.parent_id;

  const formatLabel = (labelName: string) => (
    <strong>
      {labelName}
    </strong>
  );

  const groupNameLabel = formatLabel("Group name");
  const groupDescLabel = formatLabel("Group description (optional)");
  const groupVisibility = formatLabel("Visibility level");

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

  const onFinish = (values) => {
    console.log(values)
    console.log(parentId)
  }

  const nameRules: Rule[] = [{
    required: true,
    message: 'Group name是必填项，请输入'
  }];

  return (
    <Row>
      <Col span={3} />
      <Col span={18}>
        <h1>Naming, visibility</h1>
        <Divider />
        <Form
          layout={'vertical'}
          form={form}
          onFinish={onFinish}
          requiredMark={false}
          initialValues={{
            groupVisibility: 0
          }}
        >
          <Form.Item label={groupNameLabel} name={'groupName'} rules={nameRules}>
            <Input style={getGroupNameLabelStyle()} placeholder="My awesome group"/>
          </Form.Item>
          <Form.Item label={groupDescLabel}  name={'groupDesc'}>
            <TextArea style={getGroupPathAndDescStyle()} allowClear/>
          </Form.Item>
          <Form.Item label={groupVisibility} name={'groupVisibility'}>
            <Radio.Group>
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
            <Button type="primary" htmlType={'submit'}>Save changes</Button>
          </Form.Item>
        </Form>
      </Col>
      <Col span={3} />
    </Row>
  );
};
