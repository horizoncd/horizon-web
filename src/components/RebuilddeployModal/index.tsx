import { InfoCircleOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import { useIntl, useRequest } from 'umi';
import { useEffect, useState } from 'react';
import { ClusterStatus, PublishType, TaskStatus } from '@/const';
import {
  getClusterBuildStatusV2, getClusterResourceTree, getClusterStatusV2, getStepV2,
} from '@/services/clusters/clusters';
import getSortedKey from './util';

interface RebuilddeployModalProps {
  clusterID: number;
  clusterFullPath: string;
  onCancel: () => void;
}

function RebuilddeployModal(props: RebuilddeployModalProps) {
  const {
    clusterID, clusterFullPath, onCancel,
  } = props;

  const intl = useIntl();
  const [revisions, setRevisions] = useState<string[]>([]);
  const [withoutConfirm, setWithoutConfirm] = useState(false);
  const [nonBuilding, setNonBuilding] = useState(false);
  const [progressing, setProgressing] = useState(false);

  useEffect(() => {
    if (withoutConfirm) {
      window.location.href = `/clusters${clusterFullPath}/-/pipelines/new?type=${PublishType.BUILD_DEPLOY}`;
    }
  }, [clusterFullPath, withoutConfirm]);

  const { data: step, run: getStep } = useRequest(() => getStepV2(clusterID), {
    manual: true,
  });

  const { run: getResourceTree } = useRequest(() => getClusterResourceTree(clusterID), {
    manual: true,
    onSuccess: (data) => {
      const sortedKey = getSortedKey(data);
      const r: string[] = sortedKey.map((key) => {
        const parts = key.split('/');
        if (parts.length > 0) {
          return parts[parts.length - 1];
        }
        return '';
      });
      setRevisions(r);
      if (r.length <= 1) {
        setWithoutConfirm(true);
      }
    },
  });

  useRequest(() => getClusterStatusV2(clusterID), {
    onSuccess: (status) => {
      if (status.status === ClusterStatus.PROGRESSING
        || status.status === ClusterStatus.MANUALPAUSED
        || status.status === ClusterStatus.SUSPENDED
        || status.status === ClusterStatus.NOTHEALTHY
        || status.status === ClusterStatus.DEGRADED) {
        setProgressing(true);
        getStep();
      } else {
        setWithoutConfirm(true);
      }

      if (status.status !== ClusterStatus.FREED
        && status.status !== ClusterStatus.NOTFOUND) {
        getResourceTree();
      } else {
        setWithoutConfirm(true);
      }
    },
  });

  useRequest(() => getClusterBuildStatusV2(clusterID), {
    onSuccess: (status) => {
      const taskStatus = status.runningTask.taskStatus as TaskStatus;
      if (taskStatus !== TaskStatus.RUNNING
        && taskStatus !== TaskStatus.PENDING
        && taskStatus !== TaskStatus.FAILED) {
        setNonBuilding(true);
      } else {
        setWithoutConfirm(true);
      }
    },
  });

  return (
    <Modal
      width={520}
      title={(
        <div>
          <InfoCircleOutlined style={{ fontSize: '20px', color: '#faad14', marginRight: 8 }} />
          {intl.formatMessage({ id: 'pages.message.cluster.builddeploy.rebuild.confirm' })}
        </div>
      )}
      open={nonBuilding && progressing && step && step.index !== step.total && revisions.length > 1}
      onCancel={onCancel}
      onOk={() => {
        window.location.href = `/clusters${clusterFullPath}/-/pipelines/new?type=${PublishType.BUILD_DEPLOY}`;
      }}
    >
      <div>
        <p>{intl.formatMessage({ id: 'pages.message.cluster.builddeploy.rebuild.content' })}</p>
        <p>
          <span style={{ color: 'green', fontWeight: 'bold' }}>
            {intl.formatMessage({ id: 'pages.message.cluster.builddeploy.rebuild.current' })}
          </span>
          {revisions[0]}
        </p>
        <p>
          <span style={{ color: 'red', fontWeight: 'bold' }}>
            {intl.formatMessage({ id: 'pages.message.cluster.builddeploy.rebuild.rollback' })}
          </span>
          {revisions[revisions.length - 1]}
        </p>
      </div>
    </Modal>
  );
}

export default RebuilddeployModal;
