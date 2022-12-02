import { BookOutlined } from '@ant-design/icons';
import { Tabs } from 'antd';
import React, { useState } from 'react';
import { useIntl, useRequest } from 'umi';
import type { API } from '@/services/typings';
import { listClusters } from '@/services/clusters/clusters';
import { listApplications } from '@/services/applications/applications';
import type { CLUSTER } from '@/services/clusters';
import NoData from '@/components/NoData';
import { DTree, DTreeItemProp } from '@/components/DirectoryTree';
import { ComponentWithPagination } from '../../../../components/Enhancement';

const { TabPane } = Tabs;

const ApplicationNoData = <NoData titleID="pages.header.applications" descID="pages.noData.release.application.desc" />;

interface AppItem extends API.Application {
  icon?: React.ReactNode;
}

const ClusterNoData = <NoData titleID="pages.header.clusters" descID="pages.noData.release.cluster.desc" />;

const DTreeWithPagination = ComponentWithPagination(DTree);

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
  listApplications,
  ApplicationNoData,
);

const ClusterTree = treeWithPagination(
  (item: CLUSTER.Cluster) => item,
  listClusters,
  ClusterNoData,
);

const ReleaseTab = (props: { template: string; release: string }) => {
  const { template, release } = props;
  const intl = useIntl();
  return (
    <Tabs>
      <TabPane key="app" tab={intl.formatMessage({ id: 'pages.header.applications' })}>
        <AppTree template={template} release={release} />
      </TabPane>
      <TabPane key="clsuter" tab={intl.formatMessage({ id: 'pages.header.clusters' })}>
        <ClusterTree template={template} release={release} />
      </TabPane>
    </Tabs>
  );
};

export default ReleaseTab;
