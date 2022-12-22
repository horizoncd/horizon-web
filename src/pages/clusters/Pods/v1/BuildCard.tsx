import { Button, Card } from 'antd';
import { useIntl, useModel, useRequest } from 'umi';
import { CopyOutlined, FullscreenOutlined } from '@ant-design/icons';
import { useState } from 'react';
import copy from 'copy-to-clipboard';
import { cancelPipeline, queryPipelineLog } from '@/services/pipelineruns/pipelineruns';
import CodeEditor from '@/components/CodeEditor';
import styles from '../index.less';
import FullscreenModal from '@/components/FullscreenModal';
import { RunningTask, TaskStatus } from '@/const';
import { Progressing } from '@/components/Widget';

interface BuildCardProps {
  pipelinerunID: number
  runningTask: CLUSTER.RunningTask,
}

function BuildCard(props: BuildCardProps) {
  const { pipelinerunID, runningTask } = props;
  const [fullscreen, setFullscreen] = useState(false);
  const intl = useIntl();
  const { successAlert, errorAlert } = useModel('alert');

  const { data: buildLog } = useRequest(() => queryPipelineLog(pipelinerunID), {
    formatResult: (res) => res,
    pollingInterval: 6000,
  });

  const onCopyButtonClick = () => {
    if (copy(buildLog ?? '')) {
      successAlert(intl.formatMessage({ id: 'component.FullscreenModal.copySuccess' }));
    } else {
      errorAlert(intl.formatMessage({ id: 'component.FullscreenModal.copyFailed' }));
    }
  };
  const onFullscreenClick = () => {
    setFullscreen(true);
  };

  const onClose = () => {
    setFullscreen(false);
  };

  const canCancel = (() => {
    const taskStatus = runningTask.taskStatus as TaskStatus;
    const task = runningTask.task as RunningTask;
    return task === RunningTask.BUILD && (taskStatus === TaskStatus.RUNNING || taskStatus === TaskStatus.PENDING);
  })();

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span
          style={{ marginBottom: '10px', fontSize: '16px', fontWeight: 'bold' }}
        >
          {intl.formatMessage({ id: 'pages.pods.buildLog' })}
        </span>
        {
                canCancel && (
                <Button
                  danger
                  style={{ marginLeft: '10px', marginBottom: '10px' }}
                  onClick={() => {
                    cancelPipeline(pipelinerunID).then(() => {
                      successAlert(intl.formatMessage({ id: 'pages.message.cluster.deployCancel.success' }));
                    });
                  }}
                >
                  {intl.formatMessage({ id: 'pages.pods.deployCancel' })}
                </Button>
                )
                      }
        <Progressing
          style={{ marginBottom: '10px', marginLeft: '10px' }}
          title={intl.formatMessage({ id: 'pages.cluster.status.building' })}
        />
        <div style={{ flex: 1 }} />
        <Button className={styles.buttonClass}>
          <CopyOutlined className={styles.iconCommonModal} onClick={onCopyButtonClick} />
        </Button>
        <Button className={styles.buttonClass}>
          <FullscreenOutlined className={styles.iconCommonModal} onClick={onFullscreenClick} />
        </Button>
      </div>
      <div style={{ height: '500px' }}>
        <CodeEditor content={buildLog ?? ''} />
      </div>
      <FullscreenModal
        title=""
        visible={fullscreen}
        onClose={onClose}
        fullscreen
        supportFullscreenToggle={false}
      >
        <CodeEditor
          content={buildLog ?? ''}
        />
      </FullscreenModal>
    </Card>
  );
}

export default BuildCard;
