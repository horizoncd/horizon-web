import { useState } from 'react';
import { Card } from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import { useIntl } from 'umi';
import { useRequest } from '@@/plugin-request/request';

import { querySchema } from '@/services/templates/templates';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import 'antd/lib/form/style';
import JsonSchemaForm from '@/components/JsonSchemaForm';
import { getClusterV2 } from '@/services/clusters/clusters';
import { pipelineV2 } from '@/services/version/version';
import { getBuildSchema } from '@/services/buildschema/buildschema';
import { ResourceType } from '@/const';
import { CLUSTER } from '@/services/clusters';
import Basic from '../Basic';
import Output from '../Output';
import Tag from '../Tag';
import { CardTitle } from '../Widget';
import { MaxSpace } from '@/components/Widget';

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
  };
  const [cluster, setCluster] = useState<CLUSTER.ClusterV2>(defaultCluster);

  const { data: buildSchema } = useRequest(() => getBuildSchema());

  const { data: templateSchema } = useRequest(
    () => querySchema(cluster.templateInfo.name, cluster.templateInfo.release, {
      clusterID,
      resourceType: ResourceType.CLUSTER,
    }),
    {
      ready: !!cluster && !!cluster.templateInfo.name && !!cluster.templateInfo.release,
    },
  );

  const { data: clusterData, run: refreshCluster } = useRequest(() => getClusterV2(clusterID), {
    onSuccess: () => {
      setCluster(clusterData!);
    },
    ready: resourceType === ResourceType.CLUSTER && !!clusterID,
  });

  return (
    <PageWithBreadcrumb>
      <Basic
        applicationID={applicationID}
        clusterFullPath={clusterFullPath}
        cluster={cluster}
        refreshCluster={refreshCluster}
        version={pipelineV2}
      />
      <MaxSpace
        direction="vertical"
        size="middle"
      >
        <Card
          title={(
            <CardTitle>{intl.formatMessage({ id: 'pages.clusterDetail.basic.config' })}</CardTitle>)}
          type="inner"
        >
          {
            buildSchema && cluster.buildConfig
              && (
                <JsonSchemaForm
                  disabled
                  uiSchema={buildSchema.uiSchema}
                  jsonSchema={buildSchema.jsonSchema}
                  formData={cluster.buildConfig}
                />
              )
          }
          {
            (templateSchema && cluster.templateConfig)
              && (
                <JsonSchemaForm
                  disabled
                  uiSchema={templateSchema.application.uiSchema}
                  jsonSchema={templateSchema.application.jsonSchema}
                  formData={cluster.templateConfig}
                />
              )
          }
        </Card>
        <Output clusterID={clusterID} />
        <Tag
          clusterID={clusterID}
          clusterFullPath={clusterFullPath}
        />
      </MaxSpace>
    </PageWithBreadcrumb>
  );
};
