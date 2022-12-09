import { CopyOutlined, FullscreenOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useIntl, useModel } from 'umi';
import copy from 'copy-to-clipboard';
import CodeEditor from '@/components/CodeEditor';
import { cancelPipeline } from '@/services/pipelineruns/pipelineruns';
import styles from '../index.less';

interface BuildStepBarProps {
  statusData: CLUSTER.ClusterStatusV2,
  buildLog: string,
  setFullscreen: (arg: boolean) => void,
}

function BuildStepBar(props: BuildStepBarProps) {
  const { statusData, buildLog, setFullscreen } = props;
  const intl = useIntl();
  const { successAlert, errorAlert } = useModel('alert');

  const onCopyButtonClick = () => {
    if (copy(buildLog)) {
      successAlert(intl.formatMessage({ id: 'component.FullscreenModal.copySuccess' }));
    } else {
      errorAlert(intl.formatMessage({ id: 'component.FullscreenModal.copyFailed' }));
    }
  };
  const onFullscreenClick = () => {
    setFullscreen(true);
  };

  return (
    <div className={styles.stepsContent}>
      <div>
        <div style={{ display: 'flex' }}>
          <span
            style={{ marginBottom: '10px', fontSize: '16px', fontWeight: 'bold' }}
          >
            {intl.formatMessage({ id: 'pages.pods.buildLog' })}
          </span>
          {
                        canCancelPublish(statusData)
                        && (
                        <Button
                          danger
                          style={{ marginLeft: '10px', marginBottom: '10px' }}
                          onClick={() => {
                            cancelPipeline(statusData!.latestPipelinerun!.id).then(() => {
                              successAlert(intl.formatMessage({ id: 'pages.message.cluster.deployCancel.success' }));
                            });
                          }}
                        >
                          {intl.formatMessage({ id: 'pages.pods.deployCancel' })}
                        </Button>
                        )
                      }
          <div style={{ flex: 1 }} />
          <Button className={styles.buttonClass}>
            <CopyOutlined className={styles.iconCommonModal} onClick={onCopyButtonClick} />
          </Button>
          <Button className={styles.buttonClass}>
            <FullscreenOutlined className={styles.iconCommonModal} onClick={onFullscreenClick} />
          </Button>
        </div>
        <div style={{ height: '500px' }}>
          <CodeEditor content={buildLog} />
        </div>
      </div>
    </div>
  );
}

export default BuildStepBar;
