import { Button, Modal, Tooltip } from 'antd';
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
import { MicroApp } from '@/components/Widget';

export default function Basic(props: any) {
  const {
    applicationID, clusterFullPath, cluster, refreshCluster, version,
  } = props;

  const { successAlert, errorAlert } = useModel('alert');
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
    ready: version !== pipelineV2 && !!cluster.scope.environment,
  });

  const editClusterRoute = () => {
    if (version !== pipelineV2) {
      return `/clusters${clusterFullPath}/-/edit`;
    }
    if (cluster.git?.url) {
      return `/clusters${clusterFullPath}/-/editv2/gitimport`;
    }
    return `/clusters${clusterFullPath}/-/editv2/imagedeploy`;
  };

  const regionName = version !== pipelineV2
    ? region2DisplayName.get(cluster.scope.region)
    : cluster.scope.regionDisplayName;

  const { gitRefType, gitRef } = parseGitRef({
    httpURL: '',
    url: cluster.git?.url || '',
    subfolder: cluster.git?.subfolder || '',
    branch: cluster.git?.branch || '',
    tag: cluster.git?.tag || '',
    commit: cluster.git?.commit || '',
  });

  const serviceDetail: Param[][] = [
    [
      { key: intl.formatMessage({ id: 'pages.clusterDetail.basic.name' }), value: cluster.name },
      { key: intl.formatMessage({ id: 'pages.clusterDetail.basic.priority' }), value: cluster.priority },
      {
        key: intl.formatMessage({ id: 'pages.common.region' }),
        value: cluster ? regionName : '',
      },
      {
        key: intl.formatMessage({ id: 'pages.common.env' }),
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
      { key: intl.formatMessage({ id: 'pages.clusterDetail.basic.url' }), value: cluster.git?.url },
      {
        key: intl.formatMessage({ id: `pages.clusterDetail.basic.${gitRefType}` }),
        value: gitRef,
      },
      {
        key: intl.formatMessage({ id: 'pages.clusterDetail.basic.subfolder' }),
        value: cluster.git?.subfolder,
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
    successAlert(intl.formatMessage({ id: 'pages.message.copyID.success' }));
  };

  return (
    <div>
      <AvatarBlock>
        <ResourceAvatar name={cluster.name} size={64} />
        <FlexColumn>
          <TitleText>{cluster.name}</TitleText>
          <IDText>
            <Tooltip title={intl.formatMessage({ id: 'pages.message.copyID.tooltip' })}>
              {
                // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                <NoPaddingButton
                  type="text"
                  size="small"
                  onClick={onIDClick}
                >
                  {intl.formatMessage({ id: 'pages.cluster.id' })}
                  {': '}
                  {cluster.id}
                </NoPaddingButton>
              }
            </Tooltip>
          </IDText>
        </FlexColumn>
        <div className={styles.flex} />
        <MicroApp name="clustercopy" clusterName={cluster.name} />
        <Button className={styles.button} onClick={refreshCluster}><ReloadOutlined /></Button>
        <Button
          type="primary"
          className={styles.button}
          disabled={!RBAC.Permissions.updateCluster.allowed}
          onClick={() => history.push({
            pathname: editClusterRoute(),
          })}
        >
          {intl.formatMessage({ id: 'pages.clusterDetail.basic.edit' })}
        </Button>
        {
          (version !== pipelineV2 && cluster.template.name) && (
            <MicroApp
              name="upgrade"
              clusterID={cluster.id}
              template={cluster.template.name}
              disabled={!RBAC.Permissions.upgradeCluster.allowed}
              successAlert={successAlert}
              errorAlert={errorAlert}
              modalConfirm={Modal.confirm}
            />
          )
        }
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
