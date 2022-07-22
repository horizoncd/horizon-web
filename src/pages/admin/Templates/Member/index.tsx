import React from 'react';
import {inviteTemplateMember, queryTemplateMembers, removeMember, updateMember} from "@/services/members/members";
import {queryTemplate} from '@/services/templates/templates';
import Member from '@/components/Member'
import {ResourceType} from '@/const'
import {useIntl} from "@@/plugin-locale/localeExports";
import RBAC from "@/rbac";
import {useParams, useRequest} from 'umi';

export default (): React.ReactNode => {
  const intl = useIntl();
  const params = useParams<{id: string}>()
  const templateID = params.id
  const {data:template} = useRequest(()=>queryTemplate(templateID))

  return (
    <Member
      title={intl.formatMessage({id: 'pages.groups.members.title'})}
      resourceType={ResourceType.TEMPLATE}
      resourceID={templateID}
      resourceName={template?.name as string}
      onInviteMember={(member) => {
        return inviteTemplateMember(member)
      }}
      onUpdateMember={(id, member) => {
        return updateMember(id, member)
      }}
      onListMembers={(resourceID) => {
        return queryTemplateMembers(resourceID)
      }}
      onRemoveMember={(id) => {
        return removeMember(id)
      }}
      allowInvite={RBAC.Permissions.createTemplateMember.allowed}
    />
  );
};
