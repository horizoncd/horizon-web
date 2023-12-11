import { useState } from 'react';
import { Tabs } from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import { useIntl } from 'umi';
import { useRequest } from '@@/plugin-request/request';

import TabPane from 'antd/lib/tabs/TabPane';
import { querySchema } from '@/services/templates/templates';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import 'antd/lib/form/style';
import { getCluster } from '@/services/clusters/clusters';
import { pipelineV1 } from '@/services/version/version';
import { ResourceType } from '@/const';
import Basic from '../Basic';
import Output from '../Output';
import { Tag, AdminTag } from '../Tag';
import ConfigCard from '../ConfigCard';

export default () => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');

  const {
    id: clusterID, fullPath: clusterFullPath, type, parentID: applicationID,
  } = initialState!.resource;

  const [cluster, setCluster] = useState<CLUSTER.Cluster>();

  const { data: templateSchema, run: runQuerySchema } = useRequest(
    () => querySchema(cluster!.template.name, cluster!.template.release, {
      clusterID,
      resourceType: ResourceType.INSTANCE,
    }),
    {
      ready: !!cluster && !!cluster.template.name && !!cluster.template.release,
    },
  );

  const { data: clusterData, run: refreshCluster } = useRequest(() => getCluster(clusterID), {
    onSuccess: () => {
      setCluster(clusterData!);
      // query schema by template and release
      runQuerySchema();
    },
    ready: type === ResourceType.INSTANCE && !!clusterID,
    refreshDeps: [clusterID],
  });

  if (!cluster) {
    return null;
  }

  return (
    <PageWithBreadcrumb>
      <Basic
        applicationID={applicationID}
        clusterFullPath={clusterFullPath}
        cluster={cluster}
        refreshCluster={refreshCluster}
        version={pipelineV1}
      />
      <Tabs>
        <TabPane tab={intl.formatMessage({ id: 'pages.clusterDetail.basic.config' })} key="1">
          <ConfigCard
            templateSchema={templateSchema}
            cluster={cluster}
          />
        </TabPane>
        <TabPane tab={intl.formatMessage({ id: 'pages.clusterDetail.output' })} key="2">
          <Output clusterID={clusterID} />
        </TabPane>
        <TabPane tab={intl.formatMessage({ id: 'pages.tags.normal' })} key="3">
          <Tag
            clusterID={clusterID}
            clusterFullPath={clusterFullPath}
          />
        </TabPane>
        <TabPane tab={intl.formatMessage({ id: 'pages.tags.admin' })} key="4">
          <AdminTag
            clusterID={clusterID}
            clusterFullPath={clusterFullPath}
          />
        </TabPane>
      </Tabs>
    </PageWithBreadcrumb>
  );
};
