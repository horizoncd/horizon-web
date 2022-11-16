import React, { useState } from 'react';
import { useRequest } from 'umi';
import { BookOutlined } from '@ant-design/icons';
import { DTree } from '@/components/DirectoryTree';
import { ComponentWithPagination } from '@/components/Enhancement';
import { listApplications } from '@/services/applications/applications';
import { API } from '@/services/typings';

const DTreeWithPagination = ComponentWithPagination(DTree);

function AppList(props: { userID: number }) {
  const { userID } = props;

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [items, setItems] = useState([] as API.Application[]);
  const [total, setTotal] = useState(0);
  useRequest(
    () => listApplications({ userID, pageNumber, pageSize }),
    {
      onSuccess: (data) => {
        const { items: appItems, total: appTotal } = data;
        const newItems = appItems.map((item) => {
          const t = { icon: <BookOutlined />, ...item } as API.Application & { icon: React.ReactElement };
          return t;
        });
        setItems(newItems);
        setTotal(appTotal);
      },
      refreshDeps: [pageNumber, pageSize, userID],
    },
  );

  const onPageChange = (pn: number, pz: number) => {
    if (pn) {
      setPageNumber(pn);
    }
    if (pz) {
      setPageSize(pz);
    }
  };

  return (
    <DTreeWithPagination
      items={items}
      total={total}
      page={pageNumber}
      pageSize={pageSize}
      onPageChange={onPageChange}
    />
  );
}

export default AppList;
