import React from 'react';
import { useModel } from '@@/plugin-model/useModel';
import { useIntl } from '@@/plugin-locale/localeExports';
import {
  inviteApplicationClusterMember,
  queryApplicationClusterMembers,
  removeMember,
  updateMember,
} from '@/services/members/members';
import Member from '@/components/Member';
import { ResourceType } from '@/const';
import RBAC from '@/rbac';

export default (): React.ReactNode => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const { id: applicationID, name: applicationName } = initialState!.resource;

  return (
    <Member
      title={intl.formatMessage({ id: 'pages.cluster.members.title' })}
      resourceType={ResourceType.CLUSTER}
      resourceID={applicationID}
      resourceName={applicationName}
      onInviteMember={(member) => inviteApplicationClusterMember(member)}
      onUpdateMember={(id, member) => updateMember(id, member)}
      onListMembers={(resourceID) => queryApplicationClusterMembers(resourceID)}
      onRemoveMember={(id) => removeMember(id)}
      allowInvite={RBAC.Permissions.createClusterMember.allowed}
    />
  );
};
