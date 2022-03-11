import React, {useEffect, useState} from 'react';
import {Select, Card, Button} from 'antd';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb'
import {useModel} from "@@/plugin-model/useModel";

const {Option} = Select;

const Complete: React.FC = () => {

  const [groups, setGroups] = useState<API.PageResult<API.Group>>({total:0, items:[]});
  const groupsOptions = groups.items.map(function (group) {
    return <Option key={group.id} value={group.id}>{group.fullName}</Option>
  })

  // get the currentUserID and applicationID from initState
  const {initialState} =  useModel('@@initialState')
  const currentUserId = initialState?.currentUser?.id  as number
  const id = initialState?.resource.id as number;
  console.log(id)
  useEffect(() => {
    GetGroupsByUser(currentUserId)
  })

  const GetGroupsByUser = (currentUser: number) => {
    //TODO remote the mock and call the restapi
    const defaultGroup: API.Group = {fullName: "tom", fullPath: "/horizon/start/tom", id: 2, name: "tom", path: "tom"}
    const mockGroups = {
      total: 3,
      items: [
        defaultGroup,
        defaultGroup,
        defaultGroup
      ]
    }
    setGroups(mockGroups);
  }

  const onTransferClick = () => {
    // call the transfer api
    // if success redirect the uri
  }

  return (
    <PageWithBreadcrumb>
      <Card title="Transfer Application">
        <p>
          this this is extra info
        </p>
        <Select
          showSearch
          style={{ width: '61.8%' }}
          placeholder="Search to Select"
          optionFilterProp="children">
          options: {groupsOptions}
        </Select>
        <p></p>
        <Button type="primary" danger
                size="large"
                onClick={() => {
                  onTransferClick()
                }}>
          TransferGroup
        </Button>
      </Card>
    </PageWithBreadcrumb>
  );
};

export default Complete;
