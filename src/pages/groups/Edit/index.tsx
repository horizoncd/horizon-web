import {Col, Divider, Row, Form, Button, Input, Space, Radio, notification} from 'antd';
import { Rule } from 'rc-field-form/lib/interface'
import './index.less'
import {useEffect} from "react";
import {getGroupDetail, updateGroupDetail} from "@/services/groups/groups";
import {useModel} from "@@/plugin-model/useModel";

const { TextArea } = Input;

export default () => {
  const [form] = Form.useForm();

  const {initialState, setInitialState} = useModel('@@initialState');

  const id = initialState?.resource?.id || 0

  useEffect(() => {
    const updateDetail = async () => {
      const {data} = await getGroupDetail({id});

      form.setFieldsValue(data)
    }
    updateDetail();
  }, [id]);

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

  const onFinish = (values: API.Group) => {
    updateGroupDetail({id}, values).then(() => {
      notification.info({
        message: '修改成功',
      })
      setInitialState((s) => ({...s, resource: {...s?.resource, name: values.name}}))
    })
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
        >
          <Form.Item label={groupNameLabel} name={'name'} rules={nameRules}>
            <Input style={getGroupNameLabelStyle()} placeholder="My awesome group" disabled/>
          </Form.Item>
          <Form.Item label={groupDescLabel}  name={'description'}>
            <TextArea style={getGroupPathAndDescStyle()} allowClear/>
          </Form.Item>
          <Form.Item label={groupVisibility} name={'visibilityLevel'}>
            <Radio.Group>
              <Space direction="vertical">
                <Radio value={'public'}>
                  <div>Public</div>
                  <div>The group and any internal projects can be viewed by any logged in user</div>
                </Radio>
                <Radio value={'private'}>
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
