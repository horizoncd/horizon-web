import React from 'react';
import {useModel} from "@@/plugin-model/useModel";
import {inviteGroupMember, queryGroupMembers, removeMember, updateMember} from "@/services/members/members";
import Member from '@/components/Member'
import {useIntl} from "@@/plugin-locale/localeExports";

export default (): React.ReactNode => {
  const intl = useIntl();
  const {initialState} = useModel('@@initialState');
  const {id: groupID, name: groupName} = initialState!.resource;

  return (
    <Member
      title={intl.formatMessage({id: 'pages.groups.members.title'})}
      resourceType={"group"}
      resourceID={groupID}
      resourceName={groupName}
      onInviteMember={(resourceType, resourceID, member) => {
        return inviteGroupMember(member)
      }}
      onUpdateMember={(id, member) => {
        return updateMember(id, member)
      }}
      onListMembers={(resourceType, resourceID) => {
        return queryGroupMembers(resourceType, resourceID)
      }}
      onRemoveMember={(id) => {
        return removeMember(id)
      }}
    />
  );
};
