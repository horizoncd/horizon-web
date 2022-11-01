import { Button, Tooltip } from 'antd';
import { useState } from 'react';
import { ReloadOutlined } from '@ant-design/icons';
import { useModel } from '@@/plugin-model/useModel';
import { useHistory, useIntl } from 'umi';
import copy from 'copy-to-clipboard';
import { useRequest } from '@@/plugin-request/request';
import styles from '../index.less';
import utils from '@/utils';
import RBAC from '@/rbac';
import type { Param } from '@/components/DetailCard';
import DetailCard from '@/components/DetailCard';
import { queryEnvironments } from '@/services/environments/environments';
import { queryRegions } from '@/services/applications/applications';
import { pipelineV2 } from '@/services/version/version';
import { parseGitRef } from '@/services/code/code';
import {
  AvatarBlock, FlexColumn, TitleText, IDText, NoPaddingButton, DividerWithMargin, CardTitle,
} from '../Widget';
import ResourceAvatar from '@/components/Widget/ResourceAvatar';

export default function Basic(props: any) {
  const {
    applicationID, clusterFullPath, cluster, refreshCluster, version,
  } = props;

  const { successAlert } = useModel('alert');
  const intl = useIntl();
  const history = useHistory();
  const [env2DisplayName, setEnv2DisplayName] = useState<Map<string, string>>();
  const [region2DisplayName, setRegion2DisplayName] = useState<Map<string, string>>(new Map<string, string>());

  const { data: envs } = useRequest(queryEnvironments, {
    onSuccess: () => {
      const e = new Map<string, string>();
      envs!.forEach((item) => e.set(item.name, item.displayName));
      setEnv2DisplayName(e);
    },
  });

  const { data: regions } = useRequest(() => queryRegions(applicationID, cluster!.scope.environment), {
    onSuccess: () => {
      const e = new Map<string, string>();
      regions!.forEach((item) => e.set(item.name, item.displayName));
      setRegion2DisplayName(e);
    },
    // getClusterV2接口返回了regionDisplayName
    ready: version !== pipelineV2 && !!cluster.scope.environment,
  });

  const editClusterRoute = version !== pipelineV2
    ? `/clusters${clusterFullPath}/-/edit`
    : `/clusters${clusterFullPath}/-/editv2`;
  const regionName = version !== pipelineV2
    ? region2DisplayName.get(cluster.scope.region)
    : cluster.scope.regionDisplayName;

  const { gitRefType, gitRef } = parseGitRef(cluster.git);
  const serviceDetail: Param[][] = [
    [
      { key: intl.formatMessage({ id: 'pages.clusterDetail.basic.name' }), value: cluster.name },
      { key: intl.formatMessage({ id: 'pages.clusterDetail.basic.priority' }), value: cluster.priority },
      {
        key: '区域',
        value: cluster ? regionName : '',
      },
      {
        key: '环境',
        value: (cluster && env2DisplayName) ? env2DisplayName.get(cluster.scope.environment) : '',
      },
      { key: intl.formatMessage({ id: 'pages.clusterDetail.basic.description' }), value: cluster.description || '' },
    ],
    [
      {
        key: intl.formatMessage({ id: 'pages.clusterDetail.basic.release' }),
        value: version !== pipelineV2
          ? `${cluster.template.name}-${cluster.template.release}`
          : `${cluster.templateInfo.name}-${cluster.templateInfo.release}`,
      },
      { key: intl.formatMessage({ id: 'pages.clusterDetail.basic.url' }), value: cluster.git.url },
      {
        key: intl.formatMessage({ id: `pages.clusterDetail.basic.${gitRefType}` }),
        value: gitRef,
      },
      {
        key: intl.formatMessage({ id: 'pages.clusterDetail.basic.subfolder' }),
        value: cluster.git.subfolder,
      },
    ],
    [
      {
        key: intl.formatMessage({ id: 'pages.clusterDetail.basic.createTime' }),
        value: utils.timeToLocal(cluster.createdAt),
      },
      {
        key: intl.formatMessage({ id: 'pages.clusterDetail.basic.creator' }),
        value: cluster.createdBy.name,
      },
      {
        key: intl.formatMessage({ id: 'pages.clusterDetail.basic.updateTime' }),
        value: utils.timeToLocal(cluster.updatedAt),
      },
      {
        key: intl.formatMessage({ id: 'pages.clusterDetail.basic.updater' }),
        value: cluster.updatedBy.name,
      },
    ],
  ];

  const onIDClick = () => {
    copy(String(cluster.id));
    successAlert('ID复制成功');
  };

  return (
    <div>
      <AvatarBlock>
        <ResourceAvatar name={cluster.name} size={64} />
        <FlexColumn>
          <TitleText>{cluster.name}</TitleText>
          <IDText>
            <Tooltip title="单击可复制ID">
              {
                // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                <NoPaddingButton
                  type="text"
                  size="small"
                  onClick={onIDClick}
                >
                  Cluster ID:
                  {' '}
                  {cluster.id}
                </NoPaddingButton>
              }
            </Tooltip>
          </IDText>
        </FlexColumn>
        <div className={styles.flex} />
        <Button className={styles.button} onClick={refreshCluster}><ReloadOutlined /></Button>
        <Button
          type="primary"
          className={styles.button}
          disabled={!RBAC.Permissions.updateCluster.allowed}
          onClick={() => history.push({
            pathname: editClusterRoute,
          })}
        >
          {intl.formatMessage({ id: 'pages.clusterDetail.basic.edit' })}
        </Button>
      </AvatarBlock>
      <DividerWithMargin />
      <DetailCard
        title={(
          <CardTitle>{intl.formatMessage({ id: 'pages.clusterDetail.basic.detail' })}</CardTitle>
        )}
        data={serviceDetail}
      />
    </div>
  );
}
