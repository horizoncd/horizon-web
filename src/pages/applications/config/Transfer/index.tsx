import {Button, Card, Form, Select} from 'antd';
import {useIntl} from "@@/plugin-locale/localeExports";
import {getAuthedGroup} from "@/services/groups/groups";
import {useModel} from "@@/plugin-model/useModel";
import {useEffect, useState} from "react";
import {transferApplication} from "@/services/applications/applications";
import {history} from "@@/core/history";

export default () => {
  const intl = useIntl();
  const {successAlert} = useModel('alert')
  const [form] = Form.useForm();
  const {Option} = Select;
  const {initialState, refresh} = useModel('@@initialState');
  const applicationID = initialState!.resource.id
  const applicationName = initialState!.resource.name
  const parentID = initialState!.resource.parentID
  const [authedGroups, setAuthedGroups] = useState<API.Group[]>([]);

  // getAuthedGroup
  useEffect(() => {
      getAuthedGroup().then((result) => {
          setAuthedGroups(result["data"]);
        }
      )
    }
    , []);
  const groupMap = new Map();
  const groupsOptions = authedGroups.filter((group) => {
    return group.id != parentID
  })
    .map(function (group) {
      groupMap.set(group.id, group);
      return <Option key={group.id} value={group.id}>{group.fullName}</Option>
    })

  // doTransfer
  const onTransferClick = (values: {
    groupID: number
  }) => {
    transferApplication(applicationID, values.groupID).then(() => {
      successAlert("Application has Transfer to " + groupMap.get(values.groupID).fullName)
      history.push("/applications" +
        groupMap.get(values.groupID).fullPath + "/" + applicationName + "/-/settings/advance")
      form.resetFields()
      refresh()
    })
  }

  return (
    <Card title="Transfer Application">
      <p>
        {intl.formatMessage({id: "pages.application.transfer.desc"})}
      </p>
      <Form
        onFinish={onTransferClick}
        form={form}
      >
        <Form.Item
          name="groupID"
          rules={[{required: true, message: intl.formatMessage({id: "pages.transfer.message"})}]}
        >
          <Select
            showSearch
            style={{width: '61.8%'}}
            placeholder={intl.formatMessage({id: "pages.transfer.message"})}
            optionFilterProp="children">
            {groupsOptions}
          </Select>
        </Form.Item>
        <Button type="primary"
                htmlType="submit">{intl.formatMessage({id: "pages.transfer"})}</Button>
      </Form>
      <p></p>
    </Card>
  )
};
