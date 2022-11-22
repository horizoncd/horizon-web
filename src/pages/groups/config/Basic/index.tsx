import {
  Button, Card, Form, Input,
} from 'antd';
import type { Rule } from 'rc-field-form/lib/interface';
import './index.less';
import { useEffect, useState } from 'react';
import { useModel } from '@@/plugin-model/useModel';
import { history } from '@@/core/history';
import { useIntl } from 'umi';
import { getGroupByID, updateGroupDetail } from '@/services/groups/groups';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import RBAC from '@/rbac';

const { TextArea } = Input;

export default () => {
  const [form] = Form.useForm();
  const { successAlert } = useModel('alert');
  const intl = useIntl();

  const { initialState, refresh } = useModel('@@initialState');
  const { id } = initialState?.resource || {};

  const defaultDetail: API.Group = {
    fullName: '', fullPath: '', id: 0, name: '', path: '',
  };
  const [detail, setDetail] = useState<API.Group>(defaultDetail);

  useEffect(() => {
    const updateDetail = async () => {
      const { data } = await getGroupByID(id!);
      setDetail(data);
      form.setFieldsValue(data);
    };
    updateDetail();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const formatLabel = (labelName: string) => (
    <strong>
      {labelName}
    </strong>
  );

  const groupNameLabel = formatLabel(intl.formatMessage({ id: 'pages.common.name' }));
  const groupDescLabel = formatLabel(intl.formatMessage({ id: 'pages.common.description' }));
  const groupURLLabel = formatLabel(intl.formatMessage({ id: 'pages.common.path' }));

  const getGroupNameLabelStyle = () => ({
    width: '30%',
  });
  const getGroupPathAndDescStyle = () => ({
    width: '60%',
  });
  const getSubmitBtnStyle = () => ({
    width: '80%',
  });

  // @ts-ignore
  const getURLPrefix = () => window.location.origin + detail.fullPath.substring(0, detail.fullPath.length - detail.path.length);

  const onFinish = (values: API.Group) => {
    updateGroupDetail(id!, values).then(() => {
      successAlert(intl.formatMessage({ id: 'pages.message.groups.editSuccess' }));
      const newFullPath = `${detail.fullPath.substring(0, detail.fullPath.length - detail.path.length)}${values.path}`;
      history.replace(`/groups${newFullPath}/-/settings/basic`);
      refresh();
    });
  };

  const nameRules: Rule[] = [{
    required: true,
    message: intl.formatMessage({ id: 'pages.message.name.hint' }),
    max: 64,
  }];

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
      <Card>
        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
        >
          <Form.Item label={groupNameLabel} name="name" rules={nameRules}>
            <Input
              disabled={!RBAC.Permissions.updateGroup.allowed}
              style={getGroupNameLabelStyle()}
            />
          </Form.Item>
          <Form.Item label={groupDescLabel} name="description">
            <TextArea
              disabled={!RBAC.Permissions.updateGroup.allowed}
              style={getGroupPathAndDescStyle()}
              allowClear
              autoSize={{ minRows: 3 }}
              maxLength={255}
            />
          </Form.Item>
          <Form.Item label={groupURLLabel} name="path" rules={pathRules}>
            <Input disabled={!RBAC.Permissions.updateGroup.allowed} addonBefore={getURLPrefix()} style={getGroupPathAndDescStyle()} />
          </Form.Item>
          {
              RBAC.Permissions.updateGroup.allowed && (
              <Form.Item style={getSubmitBtnStyle()}>
                <Button type="primary" htmlType="submit">{intl.formatMessage({ id: 'pages.common.submit' })}</Button>
              </Form.Item>
              )
            }
        </Form>
      </Card>
    </PageWithBreadcrumb>
  );
};
