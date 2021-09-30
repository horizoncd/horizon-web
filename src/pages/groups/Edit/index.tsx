import {Button, Card, Col, Divider, Form, Input, notification, Popconfirm, Radio, Row, Space} from 'antd';
import {Rule} from 'rc-field-form/lib/interface'
import './index.less'
import {useEffect, useState} from "react";
import {deleteGroup, getGroupDetail, updateGroupDetail} from "@/services/groups/groups";
import {useModel} from "@@/plugin-model/useModel";
import {history} from "@@/core/history";
import {QuestionCircleOutlined} from "@ant-design/icons";
import NotFount from "@/pages/404";

const {TextArea} = Input;

export default () => {
  const [form] = Form.useForm();

  const {initialState} = useModel('@@initialState');
  const { id } = initialState?.resource || {};
  if (!id) {
    return <NotFount/>;
  }

  const defaultDetail: API.Group = {fullName: "", fullPath: "", id: 0, name: "", path: "", visibilityLevel: 0}
  const [detail, setDetail] = useState<API.Group>(defaultDetail)

  useEffect(() => {
    const updateDetail = async () => {
      const {data} = await getGroupDetail({id});
      setDetail(data)
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

  // @ts-ignore
  const getURLPrefix = () => window.location.origin + detail.fullPath.substring(0, detail.fullPath.length - detail.path.length)

  const onFinish = (values: API.Group) => {
    updateGroupDetail({id}, values).then(() => {
      notification.info({
        message: '修改成功',
      })
      const newFullPath = `${detail.fullPath.substring(0, detail.fullPath.length - detail.path.length)}${values.path}`;
      window.location.href = `/groups${newFullPath}/-/edit`
    })
  }

  const nameRules: Rule[] = [{
    required: true,
    message: 'name required, max length: 128',
    max: 128,
  }];

  const pathRules: Rule[] = [{
    required: true,
    pattern: new RegExp('^[a-z][a-z0-9-]*$'),
    message: 'URL是必填项，只支持小写字母、数字和中划线的组合，且必须以字母开头'
  }];

  const onDelete = () => {
    deleteGroup({id: detail.id}).then(() => {
      notification.info({
        message: '删除成功',
      })
      history.push('/');
    });
  }

  return (
    <Row>
      <Col span={3}/>
      <Col span={18}>
        <h1>Naming, visibility</h1>
        <h3>Update your group name, description, and visibility.</h3>
        <Divider/>
        <Form
          layout={'vertical'}
          form={form}
          onFinish={onFinish}
          requiredMark={false}
        >
          <Form.Item label={groupNameLabel} name={'name'} rules={nameRules}>
            <Input style={getGroupNameLabelStyle()} placeholder="My awesome group"/>
          </Form.Item>
          <Form.Item label={groupDescLabel} name={'description'}>
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
        <Divider/>
        <h1>Advanced</h1>
        <h3>Perform advanced options such as changing path, transferring, or removing the group.</h3>
        <Card className={'card'}>
          <h3>Change group URL</h3>
          <Form
            form={form}
            onFinish={onFinish}
            requiredMark={false}
          >
            <Form.Item name={'path'} rules={pathRules}>
              <Input addonBefore={getURLPrefix()} style={{width: '100%'}} placeholder="my-awesome-group"/>
            </Form.Item>
            <Form.Item style={getSubmitBtnStyle()}>
              <Button style={{backgroundColor: '#ab6100', color: 'white'}} htmlType={'submit'}>Change path</Button>
            </Form.Item>
          </Form>
        </Card>
        <Row style={{height: '30px'}}/>
        <Card className={'card'}>
          <h3 style={{color: '#dd2b0e', fontSize: 'bold'}}>Remove group</h3>
          <h4 style={{fontSize: 'bold'}}>Removed group can not be restored!</h4>
          <Popconfirm title="Are you sure？" icon={<QuestionCircleOutlined style={{color: 'red'}}/>}
                      onConfirm={onDelete}>
            <Button style={{backgroundColor: '#dd2b0e', color: 'white'}}>Remove group</Button>
          </Popconfirm>
        </Card>
      </Col>
      <Col span={3}/>
    </Row>
  );
};
