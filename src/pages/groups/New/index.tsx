import { Button, Col, Divider, Form, Input, notification, Row} from 'antd';
import { history, useRequest } from 'umi';
import type { Rule } from 'rc-field-form/lib/interface';
import './index.less';
import { createGroup, getGroupByID } from '@/services/groups/groups';

const { TextArea } = Input;

export default (props: any) => {
  const [form] = Form.useForm();

  const { parentID } = props.location.query;
  const intParentID = parseInt(parentID, 10);
  let parent: { fullPath: string } = { fullPath: '' };
  if (intParentID) {
    parent = useRequest(
      () =>
        getGroupByID({
          id: intParentID,
        }),
      { refreshDeps: [intParentID] },
    ).data || { fullPath: '' };
  }

  const formatLabel = (labelName: string) => <strong>{labelName}</strong>;

  const groupNameLabel = formatLabel('Group name');
  const groupPathLabel = formatLabel('Group URL');
  const groupDescLabel = formatLabel('Group description (optional)');

  const getURLPrefix = () => `${window.location.origin + parent?.fullPath}/`;

  const getGroupNameLabelStyle = () => {
    return {
      width: '40%',
    };
  };
  const getGroupPathAndDescStyle = () => {
    return {
      width: '80%',
    };
  };
  const getSubmitBtnStyle = () => {
    return {
      width: '80%',
    };
  };

  const cancel = () => history.goBack();

  const onFinish = (values: API.NewGroup) => {
    createGroup({
      ...values,
      visibilityLevel: 'private',
      parentID: intParentID,
    }).then(() => {
      notification.info({
        message: 'Group新建成功',
      });
      window.location.href = `${parent?.fullPath}/${values.path}`;
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
    <Row>
      <Col span={3} />
      <Col span={18}>
        <div style={{fontSize: "20px"}}>New group</div>
        <Divider />
        <Row>
          <Col span={4}>
            <div style={{fontSize: "16px"}}>
              Groups allow you to manage and collaborate across multiple projects. Members of a
              group have access to all of its projects.
            </div>
          </Col>
          <Col span={2} />
          <Col span={18}>
            <Form
              layout={'vertical'}
              form={form}
              onFinish={onFinish}
              requiredMark={false}
            >
              <Form.Item label={groupNameLabel} name={'name'} rules={nameRules}>
                <Input style={getGroupNameLabelStyle()} placeholder="My awesome group" />
              </Form.Item>
              <Form.Item label={groupPathLabel} name={'path'} rules={pathRules}>
                <Input
                  addonBefore={getURLPrefix()}
                  style={getGroupPathAndDescStyle()}
                  placeholder="my-awesome-group"
                />
              </Form.Item>
              <Form.Item label={groupDescLabel} name={'description'}>
                <TextArea style={getGroupPathAndDescStyle()} allowClear />
              </Form.Item>
              <Form.Item style={getSubmitBtnStyle()}>
                <div className={'form-actions'}>
                  <Button type="primary" htmlType={'submit'}>
                    Create group
                  </Button>
                  <Button style={{ float: 'right' }} onClick={cancel}>
                    Cancel
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Col>
      <Col span={3} />
    </Row>
  );
};
