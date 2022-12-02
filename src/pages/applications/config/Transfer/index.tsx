import {
  Button, Card, Form, Select,
} from 'antd';
import { useIntl } from '@@/plugin-locale/localeExports';
import { useModel } from '@@/plugin-model/useModel';
import { useEffect, useState } from 'react';
import { history } from '@@/core/history';
import { transferApplication } from '@/services/applications/applications';
import { getAuthedGroup } from '@/services/groups/groups';
import RBAC from '@/rbac';

export default () => {
  const intl = useIntl();
  const { successAlert } = useModel('alert');
  const [form] = Form.useForm();
  const { Option } = Select;
  const { initialState, refresh } = useModel('@@initialState');
  const applicationID = initialState!.resource.id;
  const applicationName = initialState!.resource.name;
  const { parentID } = initialState!.resource;
  const [authedGroups, setAuthedGroups] = useState<API.Group[]>([]);

  // getAuthedGroup
  useEffect(
    () => {
      getAuthedGroup().then((result) => {
        setAuthedGroups(result.data);
      });
    },
    [],
  );
  const groupMap = new Map();
  const groupsOptions = authedGroups.filter((group) => group.id !== parentID)
    .map((group) => {
      groupMap.set(group.id, group);
      return <Option key={group.id} value={group.id}>{group.fullName}</Option>;
    });

  // doTransfer
  const onTransferClick = (values: {
    groupID: number
  }) => {
    transferApplication(applicationID, values.groupID).then(() => {
      successAlert(`Application has transfer to ${groupMap.get(values.groupID).fullName}`);
      history.push(`/applications${
        groupMap.get(values.groupID).fullPath}/${applicationName}/-/settings/advance`);
      form.resetFields();
      refresh();
    });
  };

  return (
    <Card title={intl.formatMessage({ id: 'pages.application.transfer.title' })}>
      <p>
        {intl.formatMessage({ id: 'pages.application.transfer.desc' })}
      </p>
      <Form
        onFinish={onTransferClick}
        form={form}
      >
        <Form.Item
          name="groupID"
          rules={[{ required: true, message: intl.formatMessage({ id: 'pages.transfer.message' }) }]}
        >
          <Select
            disabled={!RBAC.Permissions.TransferApplication.allowed}
            showSearch
            style={{ width: '61.8%' }}
            placeholder={intl.formatMessage({ id: 'pages.transfer.message' })}
            optionFilterProp="children"
          >
            {groupsOptions}
          </Select>
        </Form.Item>
        <Button
          type="primary"
          disabled={!RBAC.Permissions.TransferApplication.allowed}
          htmlType="submit"
        >
          {intl.formatMessage({ id: 'pages.transfer' })}
        </Button>
      </Form>
    </Card>
  );
};
