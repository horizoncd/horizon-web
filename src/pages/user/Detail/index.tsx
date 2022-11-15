import { PropsWithChildren, useState } from 'react';
import { useIntl, useRequest } from 'umi';
import DetailCard, { Param } from '@/components/DetailCard';
import {
  ComponentWithParamIDProps, PageWithBreadcrumb, PageWithInitialState, PageWithInitialStateProps,
} from '@/components/Enhancement';
import { ExactTime } from '@/components/Widget';
import { AdminSwitch, BanSwitch } from '@/pages/user/components';
import { API } from '@/services/typings';
import { getUserByID } from '@/services/users/users';
import ResourceTabs from './ResourceTabs';
import NotFoundPage from '../../404';
import LinkList from './LinkList';

export type UserDetailProps = { userPage: boolean } & ComponentWithParamIDProps;

export function UserDetail(props: UserDetailProps) {
  const { pathID, userPage } = props;

  const intl = useIntl();
  const [user, setUser] = useState({} as API.User);
  const { refresh } = useRequest(
    () => getUserByID(pathID),
    {
      onSuccess: (data) => {
        setUser(data);
      },
    },
  );
  const isAdminInUserPage = user.isAdmin
    ? intl.formatMessage({ id: 'pages.common.yes' })
    : intl.formatMessage({ id: 'pages.common.no' });
  const isBannedeInUserPage = user.isBanned
    ? intl.formatMessage({ id: 'pages.common.yes' })
    : intl.formatMessage({ id: 'pages.common.no' });

  const data: Param[][] = [
    [
      {
        key: intl.formatMessage({ id: 'pages.common.name' }),
        value: user.name,
      },
      {
        key: intl.formatMessage({ id: 'pages.profile.email' }),
        value: user.email,
      },
      {
        key: intl.formatMessage({ id: 'pages.profile.phone' }),
        value: user.phone,
      },
    ],
    [
      {
        key: intl.formatMessage({ id: 'pages.profile.isAdmin' }),
        value: userPage
          ? isAdminInUserPage
          : <AdminSwitch id={user.id} isAdmin={user.isAdmin} onSwith={refresh} />,
      },
      {
        key: intl.formatMessage({ id: 'pages.profile.isBanned' }),
        value: userPage
          ? isBannedeInUserPage
          : <BanSwitch id={user.id} isBanned={user.isBanned} onSwith={refresh} />,
      },
    ],
    [
      {
        key: intl.formatMessage({ id: 'pages.common.createdAt' }),
        value: <ExactTime time={user.createdAt} />,
      },
      {
        key: intl.formatMessage({ id: 'pages.common.updatedAt' }),
        value: <ExactTime time={user.updatedAt} />,
      },
    ],
  ];
  return (
    <>
      <DetailCard
        title={intl.formatMessage({ id: 'pages.common.basicInfo' })}
        data={data}
      />
      <LinkList userID={pathID} withButton={userPage} />
      <ResourceTabs userID={user.id} />
    </>
  );
}

function UserDetailPage(props: PropsWithChildren<PageWithInitialStateProps>) {
  const { initialState: { currentUser } } = props;
  if (!currentUser) {
    return <NotFoundPage />;
  }
  const { id } = currentUser;
  return <UserDetail pathID={id} userPage />;
}

export default PageWithBreadcrumb(PageWithInitialState(UserDetailPage));
