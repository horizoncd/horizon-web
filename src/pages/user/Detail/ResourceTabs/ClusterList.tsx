import { useState } from 'react';
import { useRequest } from 'umi';
import { DTree } from '@/components/DirectoryTree';
import { ComponentWithPagination } from '@/components/Enhancement';
import { listClusters } from '@/services/clusters/clusters';
import { CLUSTER } from '@/services/clusters';

const DTreeWithPagination = ComponentWithPagination(DTree);

function ClusterList(props: { userID: number }) {
  const { userID } = props;

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [items, setItems] = useState([] as CLUSTER.Cluster[]);
  const [total, setTotal] = useState(0);
  useRequest(
    () => listClusters({ userID, pageNumber, pageSize }),
    {
      onSuccess: (data) => {
        const { items: clusterItems, total: clusterTotal } = data;
        setItems(clusterItems);
        setTotal(clusterTotal);
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

export default ClusterList;
