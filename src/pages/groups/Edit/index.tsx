import {Button, Card, Col, Divider, Form, Input, Popconfirm, Row} from 'antd';
import type {Rule} from 'rc-field-form/lib/interface'
import './index.less'
import {useEffect, useState} from "react";
import {deleteGroup, getGroupByID, updateGroupDetail} from "@/services/groups/groups";
import {useModel} from "@@/plugin-model/useModel";
import {history} from "@@/core/history";
import {QuestionCircleOutlined} from "@ant-design/icons";
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb'

const {TextArea} = Input;

export default () => {
  const [form] = Form.useForm();
  const {successAlert} = useModel('alert');

  const {initialState, refresh} = useModel('@@initialState');
  const {id} = initialState?.resource || {};

  const defaultDetail: API.Group = {fullName: "", fullPath: "", id: 0, name: "", path: ""}
  const [detail, setDetail] = useState<API.Group>(defaultDetail)

  useEffect(() => {
    const updateDetail = async () => {
      const {data} = await getGroupByID(id!);
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
  const groupDescLabel = formatLabel("Group description");
  const groupURLLabel = formatLabel("Group URL");

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
    updateGroupDetail(id!, values).then(() => {
      successAlert('Group修改成功');
      const newFullPath = `${detail.fullPath.substring(0, detail.fullPath.length - detail.path.length)}${values.path}`;
      history.push(`/groups${newFullPath}/-/edit`)
      refresh()
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
      successAlert('删除成功')
      history.push('/');
    });
  }

  return (
    <PageWithBreadcrumb>
      <Row>
        <Col span={3}/>
        <Col span={18}>
          <Form
            layout={'vertical'}
            form={form}
            onFinish={onFinish}
          >
            <Form.Item label={groupNameLabel} name={'name'} rules={nameRules}>
              <Input style={getGroupNameLabelStyle()} placeholder="My awesome group"/>
            </Form.Item>
            <Form.Item label={groupDescLabel} name={'description'}>
              <TextArea style={getGroupPathAndDescStyle()} allowClear autoSize={{minRows: 3}} maxLength={255}/>
            </Form.Item>
            <Form.Item label={groupURLLabel} name={'path'} rules={pathRules}>
              <Input addonBefore={getURLPrefix()} style={{width: '100%'}}/>
            </Form.Item>
            <Form.Item style={getSubmitBtnStyle()}>
              <Button type="primary" htmlType={'submit'}>Save changes</Button>
            </Form.Item>
          </Form>
          <Divider/>
          <Card className={'card'}>
            <h3 style={{color: '#dd2b0e', fontSize: 'bold'}}>Remove group</h3>
            <h4 style={{fontSize: 'bold'}}>Removed group can not be restored!</h4>
            <Popconfirm title="Are you sure？" icon={<QuestionCircleOutlined style={{color: 'red'}}/>}
                        onConfirm={onDelete}>
              <Button style={{backgroundColor: '#dd2b0e', color: 'white'}}>Remove group</Button>
            </Popconfirm>
          </Card>
        </Col>
      </Row>
    </PageWithBreadcrumb>
  );
};
