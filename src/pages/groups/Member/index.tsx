import React from 'react';
import { useModel } from '@@/plugin-model/useModel';
import { useIntl } from '@@/plugin-locale/localeExports';
import {
  inviteGroupMember, queryGroupMembers, removeMember, updateMember,
} from '@/services/members/members';
import Member from '@/components/Member';
import { ResourceType } from '@/const';
import RBAC from '@/rbac';

export default (): React.ReactNode => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const { id: groupID, name: groupName } = initialState!.resource;

  return (
    <Member
      title={intl.formatMessage({ id: 'pages.groups.members.title' })}
      resourceType={ResourceType.GROUP}
      resourceID={groupID}
      resourceName={groupName}
      onInviteMember={(member) => inviteGroupMember(member)}
      onUpdateMember={(id, member) => updateMember(id, member)}
      onListMembers={(resourceID) => queryGroupMembers(resourceID)}
      onRemoveMember={(id) => removeMember(id)}
      allowInvite={RBAC.Permissions.createGroupMember.allowed}
    />
  );
};
