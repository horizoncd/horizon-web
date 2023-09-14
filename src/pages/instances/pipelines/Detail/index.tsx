import moment from 'moment';
import { history } from '@@/core/history';
import { useIntl } from '@@/plugin-locale/localeExports';
import { useModel } from '@@/plugin-model/useModel';
import { useParams } from 'umi';
import { useRequest } from '@@/plugin-request/request';
import copy from 'copy-to-clipboard';
import { useMemo, useState } from 'react';
import {
  Button, Card, Modal,
} from 'antd';
import { CopyOutlined, FullscreenOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import type { Param } from '@/components/DetailCard';
import DetailCard from '@/components/DetailCard';
import CodeEditor from '@/components/CodeEditor';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/sql/sql';
import 'codemirror/addon/hint/show-hint.css';
import './index.less';
import 'codemirror/addon/display/fullscreen.css';
import 'codemirror/addon/display/fullscreen';
import styles from './index.less';
import CodeDiff from '@/components/CodeDiff';
import {
  getPipeline, getPipelineDiffs, listCheckRuns, queryPipelineLog,
} from '@/services/pipelineruns/pipelineruns';
import Utils from '@/utils';
import { PublishType } from '@/const';
import FullscreenModal from '@/components/FullscreenModal';
import { rollback } from '@/services/clusters/clusters';
import { GitRefType } from '@/services/code/code';
import ButtonWithoutPadding from '@/components/Widget/ButtonWithoutPadding';
import MergeBox from './MergeBox';
import { MaxSpace } from '@/components/Widget';
import MessageBox from './MessageBox';

export default (props: any) => {
  const params = useParams<{ id: string }>();
  const pipelineID = parseInt(params.id, 10);

  const intl = useIntl();
  const { location } = props;
  const { query } = location;
  // 1. true 2. false
  const { rollback: showRollback = false } = query;

  const { initialState } = useModel('@@initialState');
  const { id, fullPath } = initialState!.resource;

  const { data: pipeline } = useRequest(() => getPipeline(pipelineID), {
    pollingInterval: 6000,
    pollingWhenHidden: false,
  });
  const { data: checkruns } = useRequest(() => listCheckRuns(pipelineID), {
    pollingInterval: 6000,
    pollingWhenHidden: false,
  });
  const { data: diff } = useRequest(() => getPipelineDiffs(pipelineID));
  const { data: buildLog } = useRequest(() => queryPipelineLog(pipelineID), {
    formatResult: (res) => res,
  });

  const formatMessage = (suffix: string, defaultMsg?: string) => intl.formatMessage({ id: `pages.pipeline.${suffix}`, defaultMessage: defaultMsg });

  let refType = 'branch';
  let refValue = '';
  if (pipeline?.gitBranch) {
    refType = GitRefType.Branch;
    refValue = pipeline?.gitBranch;
  } else if (pipeline?.gitTag) {
    refType = GitRefType.Tag;
    refValue = pipeline?.gitTag;
  } else {
    refType = GitRefType.Commit;
    refValue = pipeline?.gitCommit || '';
  }

  const getSourceData = () => {
    const data: Param[] = [];
    if (pipeline?.gitURL) {
      const gitInfo: Record<string, string> = {
        'Commit ID': pipeline?.gitCommit || '',
      };
      if (refType !== GitRefType.Commit) {
        gitInfo[intl.formatMessage({ id: `pages.clusterDetail.basic.${refType}` })] = refValue;
      }
      data.push(
        {
          key: formatMessage('gitInfo'),
          value: gitInfo,
        },
      );
    }
    if (pipeline?.imageURL) {
      data.push({
        key: formatMessage('image'),
        value: pipeline?.imageURL,
      });
    }
    return data;
  };
  const getDuration = useMemo(() => {
    const data: Param[] = [];

    if (pipeline && pipeline.status !== 'pending'
      && pipeline.status !== 'ready' && pipeline.status !== 'cancelled') {
      data.push({
        key: intl.formatMessage({ id: 'pages.pipeline.duration' }),
        value: `${Utils.timeSecondsDuration(pipeline!.startedAt || pipeline!.createdAt, pipeline!.finishedAt || moment().format('YYYY-MM-DD HH:mm:ss'))}s`,
      });
    }
    return data;
  }, [pipeline, intl]);
  const data: Param[][] = [
    [
      {
        key: formatMessage('status'),
        value: pipeline?.status || 'Unknown',
      },
      {
        key: formatMessage('createdAt'),
        value: Utils.timeToLocal(pipeline?.createdAt || ''),
      },
      ...getDuration,
    ],
    [
      {
        key: formatMessage('trigger'),
        value: pipeline?.createdBy.userName || '',
      },
      ...getSourceData(),
    ],
  ];

  const cardTab = (pipeline
    && (pipeline.action === PublishType.BUILD_DEPLOY
      || pipeline.action === PublishType.DEPLOY)) ? [
      {
        key: 'Changes',
        tab: formatMessage('changes'),
      },
      {
        key: 'BuildLog',
        tab: formatMessage('buildLog'),
      },
    ] : [
      {
        key: 'Changes',
        tab: formatMessage('changes'),
      },
    ];

  const [fullscreen, setFullscreen] = useState(false);
  const { successAlert, errorAlert } = useModel('alert');
  const onFullscreenClick = () => {
    setFullscreen(true);
  };

  const { run: runRollback, loading } = useRequest((prID: number) => rollback(id, { pipelinerunID: prID }), {
    onSuccess: () => {
      // jump to pods' url
      successAlert(intl.formatMessage({ id: 'pages.message.cluster.rollback.submitted' }));
      history.push(`${fullPath}`);
    },
    manual: true,
  });

  const onClose = () => {
    setFullscreen(false);
  };

  const onCopyButtonClick = () => {
    if (copy(buildLog)) {
      successAlert(intl.formatMessage({ id: 'pages.message.copy.success' }));
    } else {
      errorAlert(intl.formatMessage({ id: 'pages.message.copy.fail' }));
    }
  };

  const extraContent = {
    BuildLog: (
      <div>
        <Button className={styles.buttonClass}>
          <CopyOutlined className={styles.iconCommonModal} onClick={onCopyButtonClick} />
        </Button>
        <Button className={styles.buttonClass}>
          <FullscreenOutlined className={styles.iconCommonModal} onClick={onFullscreenClick} />
        </Button>
      </div>
    ),
    Changes: <div />,
  };

  const content = {
    BuildLog:
  <CodeEditor
    content={buildLog}
  />,
    Changes: (
      <div>
        {
          pipeline?.action === PublishType.BUILD_DEPLOY
          && (
            <Card title={formatMessage('codeChange')} className={styles.gapBetweenCards}>
              <b>Commit ID</b>
              <br />
              {diff?.codeInfo.commitID}
              <br />
              <br />
              <b>Commit Log</b>
              <br />
              {diff?.codeInfo.commitMsg}
              <br />
              <br />
              <b>Commit History</b>
              <br />
              <ButtonWithoutPadding
                type="link"
                onClick={() => window.open(diff?.codeInfo.link)}
              >
                Link
              </ButtonWithoutPadding>
            </Card>
          )
        }
        <Card title={formatMessage('configChange')} className={styles.gapBetweenCards}>
          <CodeDiff diff={diff?.configDiff.diff || ''} />
        </Card>
      </div>
    ),
  };

  const cardContentHeight = {
    BuildLog: '600px',
    Changes: '100%',
  };

  const [activeTabKey, setActiveTabKey] = useState('Changes');

  return (
    <PageWithBreadcrumb>
      <MaxSpace direction="vertical">
        <DetailCard
          title={intl.formatMessage({ id: 'pages.common.basicInfo' })}
          data={data}
          extra={showRollback ? (
            <Button
              loading={loading}
              onClick={() => {
                Modal.confirm({
                  title: intl.formatMessage({ id: 'pages.message.cluster.rollback.confirm' }),
                  icon: <ExclamationCircleOutlined />,
                  onOk: () => {
                    runRollback(pipelineID);
                  },
                });
              }}
            >
              {formatMessage('rollback.confirm')}
            </Button>
          ) : null}
        />
        {
          pipeline && <MessageBox pipelinerunID={pipelineID} />
        }
        {
          pipeline && <MergeBox pipelinerun={pipeline} checkruns={checkruns} />
        }
        <Card
          tabList={cardTab}
          bodyStyle={{ height: cardContentHeight[activeTabKey] }}
          onTabChange={setActiveTabKey}
          tabBarExtraContent={extraContent[activeTabKey]}
        >
          {content[activeTabKey]}
        </Card>
        <FullscreenModal
          title=""
          visible={fullscreen}
          onClose={onClose}
          fullscreen
          supportFullscreenToggle={false}
        >
          <CodeEditor
            content={buildLog}
          />
        </FullscreenModal>
      </MaxSpace>
    </PageWithBreadcrumb>
  );
};
