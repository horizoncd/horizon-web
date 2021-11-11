import PageWithBreadcrumb from '@/components/PageWithBreadcrumb'
import type {Param} from '@/components/DetailCard'
import DetailCard from '@/components/DetailCard'
import CodeEditor from '@/components/CodeEditor'
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/sql/sql'
import 'codemirror/addon/hint/show-hint.css'
import './index.less'
import 'codemirror/addon/display/fullscreen.css'
import 'codemirror/addon/display/fullscreen'
import {Button, Card, notification} from "antd";
import {CopyOutlined, FullscreenOutlined} from "@ant-design/icons";
import styles from './index.less'
import copy from "copy-to-clipboard";
import FullscreenModal from '@/components/FullscreenModal'
import {useState} from "react";
import CodeDiff from '@/components/CodeDiff'
import {useParams} from 'umi';
import {useRequest} from "@@/plugin-request/request";
import {getPipeline, queryPipelineLog} from "@/services/pipelineruns/pipelineruns";
import Utils from '@/utils'
import {diffsOfCode} from "@/services/clusters/clusters";
import {useModel} from "@@/plugin-model/useModel";

export default (props: any) => {
  const params = useParams();
  const {initialState} = useModel('@@initialState');
  const {id} = initialState?.resource || {};

  // @ts-ignore
  const {data: pipeline} = useRequest(() => getPipeline(params.id))
  const {data: diff} = useRequest(() => diffsOfCode(id!, pipeline!.gitBranch), {
    ready: !!pipeline
  })
  // @ts-ignore
  const {data: buildLog} = useRequest(() => queryPipelineLog(params.id), {
    formatResult: (res) => {
      return res
    }
  })

  const data: Param[][] = [
    [
      {
        key: '状态/Status',
        value: pipeline?.status || 'Unknown',
      },
      {
        key: '启动时间/Started',
        value: Utils.timeToLocal(pipeline?.startedAt || ''),
      },
      {
        key: '持续时间/Duration',
        value: '3min',
      },
    ],
    [
      {
        key: '触发者/Trigger',
        value: pipeline?.createBy.userName || '',
      },
      {
        key: 'Git info',
        value: {
          'commit id': pipeline?.gitCommit || '',
        }
      }
    ]
  ]

  const cardTab = [
    {
      key: "BuildLog",
      tab: "构建日志"
    },
    {
      key: "Changes",
      tab: "变更内容"
    }
  ]

  const [fullscreen, setFullscreen] = useState(false)
  const onFullscreenClick = () => {
    setFullscreen(true)
  }

  const onCopyClick = () => {
    if (copy(props.content)) {
      notification.success({message: "复制成功"})
    } else {
      notification.success({message: "复制失败"})
    }
  }

  const onClose = () => {
    setFullscreen(false)
  }

  const content = {
    'BuildLog': <CodeEditor
      content={buildLog}
    />,
    'Changes': <CodeDiff diff={diff?.configDiff || ''}/>
  }

  const [activeTabKey, setActiveTabKey] = useState('BuildLog')

  return <PageWithBreadcrumb>
    <DetailCard
      title={<span>基础信息</span>}
      data={data}
    />
    <Card
      tabList={cardTab}
      bodyStyle={{height: '500px'}}
      onTabChange={setActiveTabKey}
      tabBarExtraContent={(
        <div>
          <Button className={styles.buttonClass}>
            <CopyOutlined className={styles.iconCommonModal} onClick={onCopyClick}/>
          </Button>
          <Button className={styles.buttonClass}>
            <FullscreenOutlined className={styles.iconCommonModal} onClick={onFullscreenClick}/>
          </Button>
        </div>
      )}
    >
      {content[activeTabKey]}
    </Card>
    <FullscreenModal
      title={''}
      visible={fullscreen}
      onClose={onClose}
      fullscreen={true}
      allowToggle={false}
    >
      {content[activeTabKey]}
    </FullscreenModal>
  </PageWithBreadcrumb>
}

