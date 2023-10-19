import { DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import {
  Button, Dropdown, Menu, Modal, Tooltip,
} from 'antd';
import { history, useIntl, useModel } from 'umi';
import { stringify } from 'query-string';
import { useState } from 'react';
import { RebuilddeployModal } from '@/components/rollout';
import RBAC from '@/rbac';
import { isRestrictedStatus } from '@/components/State';
import { ClusterStatus, PublishType } from '@/const';
import { deleteCluster, freeCluster, restart } from '@/services/clusters/clusters';
import { CatalogType } from '@/services/core';
import { DangerText, WarningText } from '@/components/Widget';

interface ButtonBarProps {
  clusterStatus: CLUSTER.ClusterStatusV2,
  cluster: CLUSTER.ClusterV2,
  manualPaused: boolean,
  template?: Templates.Template
}

function ButtonBarV2(props: ButtonBarProps) {
  const {
    clusterStatus, cluster, manualPaused, template = { type: CatalogType.V1 },
  } = props;
  const { id, fullPath } = cluster;
  const { status } = clusterStatus;
  const intl = useIntl();
  const { successAlert } = useModel('alert');
  const [enableRebuilddeployModal, setEnableRebuilddeployModal] = useState(false);

  const onClickOperation = ({ key }: { key: string }) => {
    switch (key) {
      case 'builddeploy':
        setEnableRebuilddeployModal(true);
        break;
      case 'deploy':
        history.push({
          pathname: `/instances${fullPath}/-/pipelines/new`,
          search: stringify({
            type: PublishType.DEPLOY,
          }),
        });
        break;
      case 'restart':
        Modal.confirm({
          title: intl.formatMessage({ id: 'pages.message.cluster.restart.confirm' }),
          onOk() {
            restart(id).then(() => {
              successAlert(intl.formatMessage({ id: 'pages.message.cluster.restart.success' }));
            });
          },
        });
        break;
      case 'rollback':
        history.push(`/instances${fullPath}/-/pipelines?category=rollback`);
        successAlert(intl.formatMessage({ id: 'pages.message.cluster.rollback.hint' }));
        break;
      case 'editCluster':
        if (cluster?.git?.url) {
          history.push(`/instances${fullPath}/-/editv2/git`);
        } else if (cluster?.image) {
          history.push(`/instances${fullPath}/-/editv2/image`);
        } else {
          history.push(`/instances${fullPath}/-/editv2/chart`, { template: { name: cluster?.templateInfo.name } });
        }
        break;
      case 'freeCluster':
        Modal.confirm({
          title: intl.formatMessage({ id: 'pages.message.cluster.free.confirm' }),
          content: intl.formatMessage({ id: 'pages.message.cluster.free.content' }),
          onOk() {
            freeCluster(id).then(() => {
              successAlert(intl.formatMessage({ id: 'pages.message.cluster.free.process' }));
            });
          },
        });
        break;
      default:
    }
  };

  const onDeleteCluster = () => {
    Modal.confirm({
      title: intl.formatMessage({ id: 'pages.message.cluster.delete.confirm' }),
      content: intl.formatMessage({ id: 'pages.message.cluster.delete.content' }),
      onOk() {
        deleteCluster(cluster!.id).then(() => {
          successAlert(intl.formatMessage({ id: 'pages.message.cluster.delete.process' }));
          window.location.href = `${cluster!.fullPath.substring(0, cluster!.fullPath.lastIndexOf('/'))}`;
        });
      },
    });
  };

  const onClickOperationWithResumePrompt = ({ key }: { key: string }) => {
    const needResumePrompt = ['builddeploy', 'deploy', 'restart', 'rollback'];
    if (manualPaused && needResumePrompt.includes(key)) {
      Modal.info({
        title: intl.formatMessage({ id: 'pages.message.cluster.resume.hint' }),
        icon: <ExclamationCircleOutlined />,
        okText: intl.formatMessage({ id: 'pages.common.confirm' }),
        onOk: () => {
          onClickOperation({ key });
        },
        onCancel: () => {
          onClickOperation({ key });
        },
      });
    } else {
      onClickOperation({ key });
    }
  };

  const operateDropdown = (
    <Menu onClick={onClickOperationWithResumePrompt}>
      <Menu.Item
        disabled={!RBAC.Permissions.updateCluster.allowed}
        key="editCluster"
      >
        {intl.formatMessage({ id: 'pages.cluster.action.edit' })}
      </Menu.Item>
      <Menu.Item
        disabled={!RBAC.Permissions.freeCluster.allowed
          || isRestrictedStatus(clusterStatus.status) || clusterStatus.status === ClusterStatus.FREED}
        key="freeCluster"
      >
        <WarningText>
          {intl.formatMessage({ id: 'pages.cluster.action.free' })}
        </WarningText>
      </Menu.Item>
      <Tooltip
        title={clusterStatus.status !== ClusterStatus.FREED && intl.formatMessage({ id: 'pages.message.cluster.delete.freeFirst' })}
      >
        <div>
          <Menu.Item
            onClick={onDeleteCluster}
            disabled={!RBAC.Permissions.deleteCluster.allowed || clusterStatus.status !== ClusterStatus.FREED}
            key="deleteCluster"
          >
            <DangerText>
              {intl.formatMessage({ id: 'pages.cluster.action.delete' })}
            </DangerText>
          </Menu.Item>
        </div>
      </Tooltip>
    </Menu>
  );

  return (
    <div style={{ marginBottom: '5px', textAlign: 'right' }}>
      <Button
        disabled={!RBAC.Permissions.buildAndDeployCluster.allowed
          || isRestrictedStatus(status)
          || !cluster.git?.url}
        type="primary"
        onClick={() => {
          onClickOperationWithResumePrompt({ key: 'builddeploy' });
        }}
        style={{ marginRight: '10px' }}
      >
        {intl.formatMessage({ id: 'pages.cluster.action.buildDeploy' })}
      </Button>
      <Button
        disabled={!RBAC.Permissions.deployCluster.allowed || isRestrictedStatus(status)}
        onClick={() => {
          onClickOperationWithResumePrompt({ key: 'deploy' });
        }}
        style={{ marginRight: '10px' }}
      >
        {intl.formatMessage({ id: 'pages.cluster.action.deploy' })}
      </Button>
      <Button
        disabled={
          !RBAC.Permissions.restartCluster.allowed
          || isRestrictedStatus(status)
          || !(template.type === CatalogType.V1 || template.type === CatalogType.Workload)
        }
        onClick={() => {
          onClickOperationWithResumePrompt({ key: 'restart' });
        }}
        style={{ marginRight: '10px' }}
      >
        {intl.formatMessage({ id: 'pages.cluster.action.restart' })}
      </Button>
      <Button
        disabled={!RBAC.Permissions.rollbackCluster.allowed || isRestrictedStatus(clusterStatus.status)}
        onClick={() => {
          onClickOperationWithResumePrompt({ key: 'rollback' });
        }}
        style={{ marginRight: '10px' }}
      >
        {intl.formatMessage({ id: 'pages.cluster.action.rollback' })}
      </Button>
      <Dropdown overlay={operateDropdown} trigger={['click']} overlayStyle={{}}>
        <Button>
          {intl.formatMessage({ id: 'pages.common.more' })}
          <DownOutlined />
        </Button>
      </Dropdown>
      <RebuilddeployModal
        open={enableRebuilddeployModal}
        setOpen={setEnableRebuilddeployModal}
        onCancel={() => {
          setEnableRebuilddeployModal(false);
        }}
        clusterID={id}
        clusterFullPath={fullPath}
      />
    </div>
  );
}

export default ButtonBarV2;
