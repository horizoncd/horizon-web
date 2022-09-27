import { useState } from 'react';
import { useRequest } from 'umi';
import { DTree } from '@/components/DirectoryTree';
import { ComponentWithPagination } from '@/components/Enhancement';
import { listTemplatesV2 } from '@/services/templates/templates';

const DTreeWithPagination = ComponentWithPagination(DTree);

function TemplateList(props: { userID: number }) {
  const { userID } = props;

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [items, setItems] = useState([] as Templates.Template[]);
  const [total, setTotal] = useState(0);
  useRequest(
    () => listTemplatesV2({
      fullpath: true, pageNumber, pageSize, userID,
    }),
    {
      onSuccess: (data) => {
        const { items: templateItems, total: appTotal } = data;
        setItems(templateItems);
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

export default TemplateList;
