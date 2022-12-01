import {
  Button, Col, Divider, Form, Input, Row,
} from 'antd';
import { history, useIntl } from 'umi';
import type { Rule } from 'rc-field-form/lib/interface';
import './index.less';
import { useModel } from '@@/plugin-model/useModel';
import type { FieldData } from 'rc-field-form/lib/interface';
import { createSubGroup } from '@/services/groups/groups';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import HForm from '@/components/HForm';

const { TextArea } = Input;

export default () => {
  const [form] = Form.useForm();
  const intl = useIntl();

  const { initialState } = useModel('@@initialState');
  const { id, fullPath } = initialState?.resource || {};
  const { successAlert } = useModel('alert');

  const formatLabel = (labelName: string) => <strong>{labelName}</strong>;

  const groupNameLabel = formatLabel(intl.formatMessage({ id: 'pages.common.name' }));
  const groupPathLabel = formatLabel(intl.formatMessage({ id: 'pages.common.path' }));
  const groupDescLabel = formatLabel(intl.formatMessage({ id: 'pages.common.description' }));

  const getURLPrefix = () => `${window.location.origin + fullPath}/`;

  const getGroupNameLabelStyle = () => ({
    width: '30%',
  });
  const getGroupPathAndDescStyle = () => ({
    width: '70%',
  });
  const getSubmitBtnStyle = () => ({
    width: '70%',
  });

  const cancel = () => history.goBack();

  const onFinish = (values: API.NewGroup) => {
    const hook = () => {
      successAlert(intl.formatMessage({ id: 'pages.message.groups.newSuccess' }));
      window.location.href = `${fullPath}/${values.path}`;
    };

    createSubGroup(id!, {
      ...values,
      visibilityLevel: 'private',
    }).then(() => {
      hook();
    });
  };

  const nameRules: Rule[] = [
    {
      required: true,
      message: intl.formatMessage({ id: 'pages.message.name.hint' }),
      max: 64,
    },
  ];

  const pathRegx = /^(?=[a-z])(([a-z][-a-z0-9]*)?[a-z0-9])?$/;

  const pathRules: Rule[] = [
    {
      required: true,
      pattern: pathRegx,
      message: intl.formatMessage({ id: 'pages.message.path.hint' }),
    },
  ];

  return (
    <PageWithBreadcrumb>
      <div style={{ fontSize: '20px' }}>{intl.formatMessage({ id: 'pages.groups.New subgroup' })}</div>
      <Divider />
      <Row>
        <Col span={5} />
        <Col span={18}>
          <HForm
            layout="vertical"
            form={form}
            onFinish={onFinish}
            onFieldsChange={(a: FieldData[], b: FieldData[]) => {
              // query regions when environment selected
              if (a[0].name[0] === 'name') {
                if (pathRegx.test(a[0].value)) {
                  const allFields = b;
                  for (let i = 0; i < allFields.length; i += 1) {
                    if (allFields[i].name[0] === 'path') {
                      allFields[i].value = a[0].value;
                    }
                  }
                  form.setFields(allFields);
                  form.validateFields(['path']);
                }
              }
            }}
          >
            <Form.Item label={groupNameLabel} name="name" rules={nameRules}>
              <Input style={getGroupNameLabelStyle()} />
            </Form.Item>
            <Form.Item label={groupPathLabel} name="path" rules={pathRules}>
              <Input
                addonBefore={getURLPrefix()}
                style={getGroupPathAndDescStyle()}
              />
            </Form.Item>
            <Form.Item label={groupDescLabel} name="description">
              <TextArea style={getGroupPathAndDescStyle()} allowClear autoSize={{ minRows: 3 }} maxLength={255} />
            </Form.Item>
            <Form.Item style={getSubmitBtnStyle()}>
              <div className="form-actions">
                <Button type="primary" htmlType="submit">
                  {intl.formatMessage({ id: 'pages.common.submit' })}
                </Button>
                <Button style={{ float: 'right' }} onClick={cancel}>
                  {intl.formatMessage({ id: 'pages.common.cancel' })}
                </Button>
              </div>
            </Form.Item>
          </HForm>
        </Col>
      </Row>
    </PageWithBreadcrumb>
  );
};
