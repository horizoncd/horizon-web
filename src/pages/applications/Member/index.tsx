import React from 'react';
import {useModel} from "@@/plugin-model/useModel";
import {inviteApplicationMember, queryApplicationMembers, removeMember, updateMember} from "@/services/members/members";
import Member from '@/components/Member'
import {ResourceType} from '@/const'
import {useIntl} from "@@/plugin-locale/localeExports";
import RBAC from '@/rbac'

export default (): React.ReactNode => {
  const intl = useIntl();
  const {initialState} = useModel('@@initialState');
  const {id: applicationID, name: applicationName} = initialState!.resource;
  return (
    <Member
      title={intl.formatMessage({id: 'pages.application.members.title'})}
      resourceType={ResourceType.APPLICATION}
      resourceID={applicationID}
      resourceName={applicationName}
      onInviteMember={(member) => {
        return inviteApplicationMember(member)
      }}
      onUpdateMember={(id, member) => {
        return updateMember(id, member)
      }}
      onListMembers={(resourceID) => {
        return queryApplicationMembers(resourceID)
      }}
      onRemoveMember={(id) => {
        return removeMember(id)
      }}
      allowInvite={RBAC.Permissions.createApplicationMember.allowed}
    />
  );
};
