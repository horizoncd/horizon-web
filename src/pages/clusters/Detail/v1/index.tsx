import { useState } from 'react';
import { Card, Tabs } from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import { useIntl } from 'umi';
import { useRequest } from '@@/plugin-request/request';

import TabPane from 'antd/lib/tabs/TabPane';
import { querySchema } from '@/services/templates/templates';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import 'antd/lib/form/style';
import JsonSchemaForm from '@/components/JsonSchemaForm';
import { getCluster } from '@/services/clusters/clusters';
import { pipelineV1 } from '@/services/version/version';
import { ResourceType } from '@/const';
import Basic from '../Basic';
import Output from '../Output';
import { Tag, AdminTag } from '../Tag';
import { CardTitle } from '../Widget';

export default () => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const [template, setTemplate] = useState([]);

  const {
    id: clusterID, fullPath: clusterFullPath, type, parentID: applicationID,
  } = initialState!.resource;

  const defaultCluster: CLUSTER.Cluster = {
    createdBy: { name: '' },
    updatedBy: { name: '' },
    latestDeployedCommit: '',
    id: 0,
    application: {
      id: 0,
      name: '',
    },
    name: '',
    priority: 'P0',
    description: '',
    template: {
      name: '',
      release: '',
    },
    git: {
      url: '',
      subfolder: '',
      branch: '',
      commit: '',
    },
    scope: {
      environment: '',
      region: '',
      regionDisplayName: '',
    },
    templateInput: undefined,
    fullPath: '',
    createdAt: '',
    updatedAt: '',
  };
  const [cluster, setCluster] = useState<CLUSTER.Cluster>(defaultCluster);

  const { data: templateData, run: runQuerySchema } = useRequest(
    () => querySchema(cluster!.template.name, cluster!.template.release, {
      clusterID,
      resourceType: ResourceType.CLUSTER,
    }),
    {
      onSuccess: () => {
        setTemplate(templateData);
      },
      ready: !!cluster && !!cluster.template.name && !!cluster.template.release,
    },
  );

  const { data: clusterData, run: refreshCluster } = useRequest(() => getCluster(clusterID), {
    onSuccess: () => {
      setCluster(clusterData!);
      // query schema by template and release
      runQuerySchema();
    },
    ready: type === ResourceType.CLUSTER && !!clusterID,
    refreshDeps: [clusterID],
  });

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
          <Card
            style={{ marginBottom: 10 }}
            title={(
              <CardTitle>{intl.formatMessage({ id: 'pages.clusterDetail.basic.config' })}</CardTitle>)}
            type="inner"
          >
            {
            template && Object.keys(template).map((item) => (
              <JsonSchemaForm
                key={item}
                disabled
                uiSchema={template[item].uiSchema}
                formData={cluster.templateInput[item]}
                jsonSchema={template[item].jsonSchema}
              />
            ))
          }
          </Card>
          <AdminTag
            clusterID={clusterID}
            clusterFullPath={clusterFullPath}
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
      </Tabs>
    </PageWithBreadcrumb>
  );
};
