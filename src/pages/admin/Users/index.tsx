import { useRequest, Link, useIntl } from 'umi';
import { Input, Table } from 'antd';
import { useState } from 'react';
import { listUsers } from '@/services/users/users';
import { API } from '@/services/typings';
import ComponentWithPagination from '@/components/Enhancement/ComponentWithPagination';
import { PageWithBreadcrumb } from '@/components/Enhancement';
import { AdminSwitch, BanHint } from '../../user/components';
import { LocationBox, MaxSpace, PopupTime } from '@/components/Widget';

const { Search } = Input;
const TableWithPagination = ComponentWithPagination(Table);

function UsersPage() {
  const [items, setItems] = useState([] as API.User[]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageNumber, setPageNumber] = useState(1);
  const [namelike, setNamelike] = useState('');
  const intl = useIntl();
  const { refresh } = useRequest(
    () => listUsers({
      filter: namelike,
      pageNumber,
      pageSize,
    }),
    {
      onSuccess: (data) => {
        const { items: dataItems, total: dataTotal } = data;
        setItems(dataItems);
        setTotal(dataTotal);
      },
      debounceInterval: 300,
      refreshDeps: [pageNumber, pageSize, namelike],
    },
  );

  const columns = [
    {
      title: intl.formatMessage({ id: 'pages.common.name' }),
      dataIndex: 'fullName',
      render: (name: string, item: API.User) => <Link to={`/admin/users/${item.id}`}>{name}</Link>,
    },
    {
      title: intl.formatMessage({ id: 'pages.profile.email' }),
      dataIndex: 'email',
    },
    {
      title: intl.formatMessage({ id: 'pages.profile.isAdmin' }),
      dataIndex: 'isAdmin',
      render: (isAdmin: boolean, item: API.User) => <AdminSwitch key={item.id} id={item.id} isAdmin={isAdmin} onSwith={refresh} />,
    },
    {
      title: intl.formatMessage({ id: 'pages.profile.isBanned' }),
      dataIndex: 'isBanned',
      render: (isBanned: boolean) => <BanHint isBanned={isBanned} />,
    },
    {
      title: intl.formatMessage({ id: 'pages.common.createdAt' }),
      dataIndex: 'createdAt',
      render: (data: string) => (<PopupTime time={data} />),
    },
  ];

  const onPageChange = (page: number, pz: number) => {
    if (page) {
      setPageNumber(page);
    }
    if (pz) {
      setPageSize(pz);
    }
  };

  return (
    <MaxSpace direction="vertical">
      <LocationBox horizontal="right">
        <Search placeholder="search by name" style={{ width: '300px' }} onChange={(e) => setNamelike(e.target.value)} />
      </LocationBox>
      <TableWithPagination
        pagination={false}
        dataSource={items}
        //@ts-ignore
        columns={columns}
        page={pageNumber}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
      />
    </MaxSpace>
  );
}

export default PageWithBreadcrumb(UsersPage);
