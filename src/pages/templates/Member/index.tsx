import React from 'react';
import { useIntl } from '@@/plugin-locale/localeExports';
import { useModel, useRequest } from 'umi';
import {
  inviteTemplateMember, queryTemplateMembers, removeMember, updateMember,
} from '@/services/members/members';
import { queryTemplate } from '@/services/templates/templates';
import Member from '@/components/Member';
import { ResourceType } from '@/const';
import RBAC from '@/rbac';
import { NotFount } from '@/components/State';

export default (): React.ReactNode => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');

  if (!initialState?.resource.id) {
    return <NotFount />;
  }
  const templateID = initialState.resource.id;
  const { data: template } = useRequest(() => queryTemplate(templateID));

  return (
    <Member
      title={intl.formatMessage({ id: 'pages.groups.members.title' })}
      resourceType={ResourceType.TEMPLATE}
      resourceID={templateID}
      resourceName={template?.name as string}
      onInviteMember={(member) => inviteTemplateMember(member)}
      onUpdateMember={(id, member) => updateMember(id, member)}
      onListMembers={(resourceID) => queryTemplateMembers(resourceID)}
      onRemoveMember={(id) => removeMember(id)}
      allowInvite={RBAC.Permissions.createTemplateMember.allowed}
    />
  );
};
