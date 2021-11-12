import {Button, Col, Divider, Form, Input, Row} from 'antd';
import {history} from 'umi';
import type {Rule} from 'rc-field-form/lib/interface';
import './index.less';
import {createGroup} from '@/services/groups/groups';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import {useModel} from "@@/plugin-model/useModel";

const {TextArea} = Input;

export default () => {
  const [form] = Form.useForm();
  const {successAlert} = useModel('alert');
  const formatLabel = (labelName: string) => <strong>{labelName}</strong>;
  const {refresh} = useModel('@@initialState');

  const groupNameLabel = formatLabel('Group name');
  const groupPathLabel = formatLabel('Group URL');
  const groupDescLabel = formatLabel('Group description');

  const getURLPrefix = () => `${window.location.origin}/`;

  const getGroupNameLabelStyle = () => {
    return {
      width: '30%',
    };
  };
  const getGroupPathAndDescStyle = () => {
    return {
      width: '70%',
    };
  };
  const getSubmitBtnStyle = () => {
    return {
      width: '70%',
    };
  };

  const cancel = () => history.goBack();

  const onFinish = (values: API.NewGroup) => {
    const hook = () => {
      successAlert('分组新建成功')
      history.push(`/${values.path}`);
      refresh()
    }

    createGroup({
      ...values,
      visibilityLevel: 'private',
    }).then(() => {
      hook()
    });
  };

  const nameRules: Rule[] = [
    {
      required: true,
      message: 'name required, max length: 128',
      max: 128,
    },
  ];

  const pathRules: Rule[] = [
    {
      required: true,
      pattern: new RegExp('^(?=[a-z])(([a-z][-a-z0-9]*)?[a-z0-9])?$'),
      message: 'URL是必填项，只支持小写字母、数字和中划线的组合，且必须以字母开头',
    },
  ];

  return (
    <PageWithBreadcrumb>
      <div style={{fontSize: "20px"}}>New group</div>
      <Divider/>
      <Row>
        <Col span={5}/>
        <Col span={18}>
          <Form
            layout={'vertical'}
            form={form}
            onFinish={onFinish}
          >
            <Form.Item label={groupNameLabel} name={'name'} rules={nameRules}>
              <Input style={getGroupNameLabelStyle()}/>
            </Form.Item>
            <Form.Item label={groupPathLabel} name={'path'} rules={pathRules}>
              <Input
                addonBefore={getURLPrefix()}
                style={getGroupPathAndDescStyle()}
              />
            </Form.Item>
            <Form.Item label={groupDescLabel} name={'description'}>
              <TextArea style={getGroupPathAndDescStyle()} allowClear autoSize={{minRows: 3}} maxLength={255}/>
            </Form.Item>
            <Form.Item style={getSubmitBtnStyle()}>
              <div className={'form-actions'}>
                <Button type="primary" htmlType={'submit'}>
                  Create group
                </Button>
                <Button style={{float: 'right'}} onClick={cancel}>
                  Cancel
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </PageWithBreadcrumb>
  );
};
