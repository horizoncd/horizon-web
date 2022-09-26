import moment from 'moment';
import { history } from '@@/core/history';
import { useIntl } from '@@/plugin-locale/localeExports';
import { useModel } from '@@/plugin-model/useModel';
import { useParams } from 'umi';
import { useRequest } from '@@/plugin-request/request';
import copy from 'copy-to-clipboard';
import { useState } from 'react';
import { Button, Card, Modal } from 'antd';
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
import { getPipeline, getPipelineDiffs, queryPipelineLog } from '@/services/pipelineruns/pipelineruns';
import Utils from '@/utils';
import { PublishType } from '@/const';
import { rollback } from '@/services/clusters/clusters';
import FullscreenModal from '@/components/FullscreenModal';
import { GitRefType } from '@/services/code/code';

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
  const [loading, setLoading] = useState(false);

  const { data: pipeline } = useRequest(() => getPipeline(pipelineID));
  const { data: diff } = useRequest(() => getPipelineDiffs(pipelineID));
  const { data: buildLog } = useRequest(() => queryPipelineLog(pipelineID), {
    formatResult: (res) => res,
  });

  const formatMessage = (suffix: string, defaultMsg: string) => intl.formatMessage({ id: `pages.pipelineNew.${suffix}`, defaultMessage: defaultMsg });

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

  const data: Param[][] = [
    [
      {
        key: '状态/Status',
        value: pipeline?.status || 'Unknown',
      },
      {
        key: '启动时间/Started',
        value: Utils.timeToLocal(pipeline?.createdAt || ''),
      },
      {
        key: '持续时间/Duration',
        value: pipeline ? `${Utils.timeSecondsDuration(pipeline!.createdAt, pipeline!.finishedAt || moment().format('YYYY-MM-DD HH:mm:ss'))}s` : '',
      },
    ],
    [
      {
        key: '触发者/Trigger',
        value: pipeline?.createdBy.userName || '',
      },
      {
        key: 'Git info',
        value: {
          'Commit ID': pipeline?.gitCommit || '',
        },
      },
    ],
  ];

  if (refType !== GitRefType.Commit) {
    data[1][1].value[intl.formatMessage({ id: `pages.clusterDetail.basic.${refType}` })] = refValue;
  }

  const cardTab = (pipeline && pipeline.action === PublishType.BUILD_DEPLOY) ? [
    {
      key: 'Changes',
      tab: '变更内容',
    },
    {
      key: 'BuildLog',
      tab: '构建日志',
    },
  ] : [
    {
      key: 'Changes',
      tab: '变更内容',
    },
  ];

  const [fullscreen, setFullscreen] = useState(false);
  const { successAlert, errorAlert } = useModel('alert');
  const onFullscreenClick = () => {
    setFullscreen(true);
  };

  const onClose = () => {
    setFullscreen(false);
  };

  const onCopyButtonClick = () => {
    if (copy(buildLog)) {
      successAlert(intl.formatMessage({ id: 'component.FullscreenModal.copySuccess' }));
    } else {
      errorAlert(intl.formatMessage({ id: 'component.FullscreenModal.copyFailed' }));
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
        <Card title={formatMessage('codeChange', '代码变更')} className={styles.gapBetweenCards}>
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
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid, jsx-a11y/no-static-element-interactions */}
          <a onClick={() => window.open(diff?.codeInfo.link)}>Link</a>
        </Card>
        )
      }
        <Card title={formatMessage('configChange', '配置变更')} className={styles.gapBetweenCards}>
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
      <DetailCard
        title={<span>基础信息</span>}
        data={data}
        extra={showRollback ? (
          <Button
            loading={loading}
            onClick={() => {
              Modal.confirm({
                title: '确定要进行回滚？',
                icon: <ExclamationCircleOutlined />,
                onOk: () => {
                  setLoading(true);
                  rollback(id, { pipelinerunID: pipelineID }).then(() => {
                    successAlert('提交回滚成功');
                    history.push(`${fullPath}`);
                  });
                },
              });
            }}
          >
            确认回滚
          </Button>
        ) : null}
      />
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
    </PageWithBreadcrumb>
  );
};
