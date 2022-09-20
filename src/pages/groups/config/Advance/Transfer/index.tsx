import {
  Button, Card, Form, Select,
} from 'antd';
import { useIntl } from '@@/plugin-locale/localeExports';
import { useModel } from '@@/plugin-model/useModel';
import { useEffect, useState } from 'react';
import { history } from '@@/core/history';
import { getAuthedGroup, transferGroup } from '@/services/groups/groups';
import RBAC from '@/rbac';

export default () => {
  const intl = useIntl();
  const { successAlert } = useModel('alert');
  const [form] = Form.useForm();
  const { Option } = Select;
  const { initialState, refresh } = useModel('@@initialState');
  const groupID = initialState!.resource.id;
  const groupName = initialState!.resource.name;
  const groupFullPath = initialState!.resource.fullPath;
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
  const groupsOptions = authedGroups.filter((group) => group.id != groupID && group.id != parentID && (group.fullPath.indexOf(groupFullPath) != 0))
    .map((group) => {
      groupMap.set(group.id, group);
      return <Option key={group.id} value={group.id}>{group.fullName}</Option>;
    });

  // doTransfer
  const onTransferClick = (values: {
    groupID: number
  }) => {
    transferGroup(groupID, values.groupID).then(() => {
      successAlert(`Group has Transfer to ${groupMap.get(values.groupID).fullName}`);
      history.push(`/groups${
        groupMap.get(values.groupID).fullPath}/${groupName}/-/settings/advance`);
      form.resetFields();
      refresh();
    });
  };

  return (
    <Card title="Transfer Group">
      <p>
        {intl.formatMessage({ id: 'pages.group.transfer.desc' })}
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
            showSearch
            disabled={!RBAC.Permissions.TransferGroup.allowed}
            style={{ width: '61.8%' }}
            placeholder={intl.formatMessage({ id: 'pages.transfer.message' })}
            optionFilterProp="children"
          >
            {groupsOptions}
          </Select>
        </Form.Item>
        <Button
          type="primary"
          disabled={!RBAC.Permissions.TransferGroup.allowed}
          htmlType="submit"
        >
          {intl.formatMessage({ id: 'pages.transfer' })}
        </Button>
      </Form>
    </Card>
  );
};
