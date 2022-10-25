import { useIntl, useModel, useRequest } from 'umi';
import { useState } from 'react';
import { Space, Table } from 'antd';
import { listIDPs } from '@/services/idps';
import { API } from '@/services/typings';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import PopupTime from '@/components/Widget/Time';
import { IDPDeleteButton, IDPEditButton, IDPNewButton } from '../Components/Bottons';
import LocationBox from '@/components/Layout/LocationBox';
import MaxSpace from '@/components/Widget/MaxSpace';

function IDPList() {
  const intl = useIntl();
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

  const columns = [
    {
      title: intl.formatMessage({ id: 'pages.idps.entity.name' }),
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
      title: intl.formatMessage({ id: 'pages.common.createdAt' }),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string) => <PopupTime time={createdAt} />,
    },
    {
      title: intl.formatMessage({ id: 'pages.common.actions' }),
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
