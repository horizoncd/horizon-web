import { PropsWithChildren, useState } from 'react';
import { useRequest } from 'umi';
import DetailCard, { Param } from '@/components/DetailCard';
import {
  ComponentWithParamIDProps, PageWithBreadcrumb, PageWithInitialState, PageWithInitialStateProps,
} from '@/components/Enhancement';
import { ExactTime } from '@/components/Widget';
import { AdminSwitch, BanSwitch } from '@/pages/admin/Users/components';
import { API } from '@/services/typings';
import { getUserByID } from '@/services/users/users';
import ResourceTabs from './ResourceTabs';
import NotFoundPage from '../../404';
import LinkList from './LinkList';

export type UserDetailProps = { userPage: boolean } & ComponentWithParamIDProps;

export function UserDetail(props: UserDetailProps) {
  const { pathID, userPage } = props;

  const [user, setUser] = useState({} as API.User);
  const { refresh } = useRequest(
    () => getUserByID(pathID),
    {
      onSuccess: (data) => {
        setUser(data);
      },
    },
  );
  const isAdminInUserPage = user.isAdmin ? '是' : '否';
  const isBannedeInUserPage = user.isBanned ? '是' : '否';

  const data: Param[][] = [
    [
      {
        key: '名称',
        value: user.name,
      },
      {
        key: 'Email',
        value: user.email,
      },
      {
        key: '电话',
        value: user.phone,
      },
    ],
    [
      {
        key: '是否为admin',
        value: userPage
          ? isAdminInUserPage
          : <AdminSwitch id={user.id} isAdmin={user.isAdmin} onSwith={refresh} />,
      },
      {
        key: '是否禁用',
        value: userPage
          ? isBannedeInUserPage
          : <BanSwitch id={user.id} isBanned={user.isBanned} onSwith={refresh} />,
      },
    ],
    [
      {
        key: '创建时间',
        value: <ExactTime time={user.createdAt} />,
      },
      {
        key: '修改时间',
        value: <ExactTime time={user.updatedAt} />,
      },
    ],
  ];
  return (
    <>
      <DetailCard
        title="基础信息"
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
