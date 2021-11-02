import React from 'react';
import {useModel} from "@@/plugin-model/useModel";
import {
  inviteApplicationClusterMember,
  queryApplicationClusterMembers,
  removeMember,
  updateMember
} from "@/services/members/members";
import Member from '@/components/Member'
import {ResourceType} from '@/const'
import {useIntl} from "@@/plugin-locale/localeExports";

export default (): React.ReactNode => {
  const intl = useIntl();
  const {initialState} = useModel('@@initialState');
  const {id: applicationID, name: applicationName} = initialState!.resource;

  return (
    <Member
      title={intl.formatMessage({id: 'pages.cluster.members.title'})}
      resourceType={ResourceType.CLUSTER}
      resourceID={applicationID}
      resourceName={applicationName}
      onInviteMember={(member) => {
        return inviteApplicationClusterMember(member)
      }}
      onUpdateMember={(id, member) => {
        return updateMember(id, member)
      }}
      onListMembers={(resourceID) => {
        return queryApplicationClusterMembers(resourceID)
      }}
      onRemoveMember={(id) => {
        return removeMember(id)
      }}
    />
  );
};
