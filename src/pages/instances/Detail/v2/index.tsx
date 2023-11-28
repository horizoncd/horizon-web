import { useState } from 'react';
import { Tabs } from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import { useIntl } from 'umi';
import { useRequest } from '@@/plugin-request/request';

import TabPane from 'antd/lib/tabs/TabPane';
import { querySchema } from '@/services/templates/templates';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import 'antd/lib/form/style';
import { getClusterV2 } from '@/services/clusters/clusters';
import { pipelineV2 } from '@/services/version/version';
import { getBuildSchema } from '@/services/buildschema/buildschema';
import { ResourceType } from '@/const';
import Basic from '../Basic';
import Output from '../Output';
import { Tag, AdminTag } from '../Tag';
import { MaxSpace } from '@/components/Widget';
import ConfigCard from '../ConfigCard';

export default () => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');

  const {
    id: clusterID, fullPath: clusterFullPath,
    type: resourceType, parentID: applicationID,
  } = initialState!.resource;

  const defaultCluster: CLUSTER.ClusterV2 = {
    createdBy: { name: '' },
    updatedBy: { name: '' },
    id: 0,
    applicationID: '',
    applicationName: '',
    name: '',
    priority: 'P0',
    description: '',
    templateInfo: {
      name: '',
      release: '',
    },
    git: {
      url: '',
      subfolder: '',
      branch: '',
      commit: '',
      tag: '',
    },
    scope: {
      environment: '',
      region: '',
      regionDisplayName: '',
    },
    buildConfig: undefined,
    templateConfig: undefined,
    fullPath: '',
    createdAt: '',
    updatedAt: '',
    expireTime: '',
    tags: [],
    manifest: undefined,
    version: 2,
  };
  const [cluster, setCluster] = useState<CLUSTER.ClusterV2>(defaultCluster);

  const { data: buildSchema } = useRequest(() => getBuildSchema());

  const { data: templateSchema } = useRequest(
    () => querySchema(cluster.templateInfo.name, cluster.templateInfo.release, {
      clusterID,
      resourceType: ResourceType.INSTANCE,
    }),
    {
      ready: !!cluster && !!cluster.templateInfo.name && !!cluster.templateInfo.release,
    },
  );

  const { data: clusterData, run: refreshCluster } = useRequest(() => getClusterV2(clusterID), {
    onSuccess: () => {
      setCluster(clusterData!);
    },
    ready: resourceType === ResourceType.INSTANCE && !!clusterID,
  });

  if (cluster.id === 0) {
    return (
      <div />
    );
  }

  return (
    <PageWithBreadcrumb>
      <MaxSpace direction="vertical" size="middle">
        <Basic
          applicationID={applicationID}
          clusterFullPath={clusterFullPath}
          cluster={cluster}
          refreshCluster={refreshCluster}
          version={pipelineV2}
        />
        <Tabs>
          <TabPane tab={intl.formatMessage({ id: 'pages.clusterDetail.basic.config' })} key="1">
            <ConfigCard
              cluster={cluster}
              templateSchema={templateSchema}
              buildSchema={buildSchema}
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
      </MaxSpace>
    </PageWithBreadcrumb>
  );
};
