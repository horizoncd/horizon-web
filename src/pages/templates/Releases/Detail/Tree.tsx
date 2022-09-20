import { BookOutlined } from '@ant-design/icons';
import { Tabs } from 'antd';
import React, { useState } from 'react';
import { useRequest } from 'umi';
import type { API } from '@/services/typings';
import { searchClusters } from '@/services/clusters/clusters';
import { searchApplications } from '@/services/applications/applications';
import type { CLUSTER } from '@/services/clusters';
import NoData from '@/components/NoData';
import { DTree, DTreeItemProp } from '@/components/DirectoryTree';
import WithPagination from '../../Components/WithPagination';

const { TabPane } = Tabs;

const ApplicationNoData = <NoData title="Applications" desc="展示所有使用该release的应用" />;

interface AppItem extends API.Application {
  icon?: React.ReactNode;
}

const ClusterNoData = <NoData title="Clusters" desc="展示所有使用该release的集群" />;

const DTreeWithPagination = WithPagination(DTree);

const treeWithPagination = <Props extends DTreeItemProp>(
  handleItem: (items: Props) => DTreeItemProp,
  requestFunc: (pageItem: API.PageParam) => Promise<{ data: API.PageResult<Props> }>,
  noData: React.ReactElement,
) => (props: { template: string; release: string }) => {
    const { template, release } = props;

    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [items, setItems] = useState([] as DTreeItemProp[]);
    const [total, setTotal] = useState(0);
    const onPageChange = (page: number, pz: number) => {
      if (pageSize) {
        setPageSize(pz);
      }
      if (page) {
        setPageNumber(page);
      }
    };

    const { data } = useRequest(
      () => requestFunc({
        pageNumber,
        pageSize,
        template,
        templateRelease: release,
      } as API.PageParam),
      {
        onSuccess: () => {
          if (!data) {
            return;
          }
          const { items: dataItems, total: t } = data;
          setItems(dataItems.map((item: Props) => handleItem(item)));
          setTotal(t);
        },
        refreshDeps: [pageNumber, pageSize],
      },
    );

    return total === 0 ? (
      noData
    ) : (
      <DTreeWithPagination
        items={items}
        page={pageNumber}
        total={total}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    );
  };

const AppTree = treeWithPagination(
  (item: API.Application) => {
    const t = item as AppItem;
    t.icon = <BookOutlined />;
    return t;
  },
  searchApplications,
  ApplicationNoData,
);

const ClusterTree = treeWithPagination(
  (item: CLUSTER.Cluster) => item,
  searchClusters,
  ClusterNoData,
);

const ReleaseTab = (props: { template: string; release: string }) => {
  const { template, release } = props;
  return (
    <Tabs>
      <TabPane key="app" tab="Applications">
        <AppTree template={template} release={release} />
      </TabPane>
      <TabPane key="clsuter" tab="Clusters">
        <ClusterTree template={template} release={release} />
      </TabPane>
    </Tabs>
  );
};

export default ReleaseTab;
