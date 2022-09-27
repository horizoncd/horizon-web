import { useRequest, Link } from 'umi';
import { Table } from 'antd';
import { useState } from 'react';
import { listUsers } from '@/services/users/users';
import { API } from '@/services/typings';
import ComponentWithPagination from '@/components/Enhancement/ComponentWithPagination';
import { PageWithBreadcrumb } from '@/components/Enhancement';
import { AdminSwitch, BanHint } from './components';

const TableWithPagination = ComponentWithPagination(Table);

function UsersPage() {
  const [items, setItems] = useState([] as API.User[]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageNumber, setPageNumber] = useState(1);
  const { refresh } = useRequest(
    () => listUsers({
      namelike: '',
      pageNumber,
      pageSize,
    }),
    {
      onSuccess: (data) => {
        const { items: dataItems, total: dataTotal } = data;
        setItems(dataItems);
        setTotal(dataTotal);
      },
      refreshDeps: [pageNumber, pageSize],
    },
  );

  const columns = [
    {
      title: '姓名',
      dataIndex: 'fullName',
      render: (name: string, item: API.User) => <Link to={`/admin/users/${item.id}`}>{name}</Link>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: '是否为Admin',
      dataIndex: 'isAdmin',
      render: (isAdmin: boolean, item: API.User) => <AdminSwitch key={item.id} id={item.id} isAdmin={isAdmin} onSwith={refresh} />,
    },
    {
      title: '是否禁止登录',
      dataIndex: 'isBanned',
      render: (isBanned: boolean) => <BanHint isBanned={isBanned} />,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
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
  );
}

export default PageWithBreadcrumb(UsersPage);
