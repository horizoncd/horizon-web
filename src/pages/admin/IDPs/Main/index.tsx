import { useModel, useRequest } from 'umi';
import { useState } from 'react';
import { Space, Table } from 'antd';
import { listIDPs } from '@/services/idps';
import { API } from '@/services/typings';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import PopupTime from '@/components/Widget/Time';
import { IDPDeleteButton, IDPEditButton, IDPNewButton } from '../Components/Bottons';
import LocationBox from '@/components/Layout/LocationBox';
import MaxSpace from '@/components/Widget/MaxSpace';

const columns = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    render: (name: string, item: API.IDP) => <a href={`/admin/idps/${item.id}`}>{name}</a>,
  },
  {
    title: 'Issuer',
    dataIndex: 'issuer',
    key: 'issuer',
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (createdAt: string) => <PopupTime time={createdAt} />,
  },
  {
    title: '操作',
    dataIndex: 'id',
    key: 'id',
    render: (id: number) => (
      <Space>
        <IDPEditButton id={id} />
        <IDPDeleteButton id={id} />
      </Space>
    ),
  },
];

function IDPList() {
  const [idps, setIdps] = useState([] as API.IDP[]);
  const { initialState } = useModel('@@initialState');
  useRequest(() => listIDPs(), {
    onSuccess: (items) => {
      setIdps(items);
    },
  });

  if (!idps || !initialState) {
    return null;
  }

  return (
    <PageWithBreadcrumb>
      <MaxSpace direction="vertical">
        {initialState.currentUser && initialState.currentUser.isAdmin
          && (
            <LocationBox horizontal="right">
              <IDPNewButton />
            </LocationBox>
          )}
        <Table columns={columns} dataSource={idps} />
      </MaxSpace>
    </PageWithBreadcrumb>
  );
}

export default IDPList;
