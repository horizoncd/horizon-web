import React from 'react';
import {useModel} from "@@/plugin-model/useModel";
import {inviteGroupMember, queryGroupMembers, removeMember, updateMember} from "@/services/members/members";
import Member from '@/components/Member'
import {ResourceType} from '@/const'
import {useIntl} from "@@/plugin-locale/localeExports";
import RBAC from "@/rbac";

export default (): React.ReactNode => {
  const intl = useIntl();
  const {initialState} = useModel('@@initialState');
  const {id: groupID, name: groupName} = initialState!.resource;

  return (
    <Member
      title={intl.formatMessage({id: 'pages.groups.members.title'})}
      resourceType={ResourceType.GROUP}
      resourceID={groupID}
      resourceName={groupName}
      onInviteMember={(member) => {
        return inviteGroupMember(member)
      }}
      onUpdateMember={(id, member) => {
        return updateMember(id, member)
      }}
      onListMembers={(resourceID) => {
        return queryGroupMembers(resourceID)
      }}
      onRemoveMember={(id) => {
        return removeMember(id)
      }}
      allowInvite={RBAC.Permissions.createGroupMember.allowed}
    />
  );
};
