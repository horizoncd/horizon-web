import {Button, Input, Modal, Space, Table, Tooltip} from "antd";
import {useIntl} from "@@/plugin-locale/localeExports";
import React, {useState} from "react";
import {useModel} from "@@/plugin-model/useModel";
import './index.less'
import FullscreenModal from "@/components/FullscreenModal";
import {useRequest} from "@@/plugin-request/request";
import {offline, online, queryPodEvents, queryPodStdout} from "@/services/clusters/pods";
import CodeEditor from '@/components/CodeEditor'
import {history} from 'umi';
import NoData from "@/components/NoData";
import copy from "copy-to-clipboard";
import {Offline, Online, PodError, PodPending, PodRunning} from '@/components/State'
import RBAC from '@/rbac'
import withTrim from "@/components/WithTrim";
import styles from './index.less'
import Utils from '@/utils'
import {env2MlogEnv} from "@/const";

import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  LoadingOutlined,
  PauseCircleOutlined
} from "@ant-design/icons";

const Search = withTrim(Input.Search);
const pollingInterval = 5000;

const status2StateNode = new Map(
  [
    ['online', <Online/>],
    ['offline', <Offline/>],
  ]
)

const LifeCycleItemAbnormal = 'Abnormal'
const LifeCycleItemSuccess = 'Success'
const LifeCycleItemWaiting = 'Waiting'
const LifeCycleItemRunning = 'Running'
const noWrap = () => ({style: {whiteSpace: 'nowrap'}})


export default (props: { data: CLUSTER.PodInTable[], cluster?: CLUSTER.Cluster }) => {
  const {data, cluster} = props;
  const intl = useIntl();
  const [pageNumber, setPageNumber] = useState(1);
  const [filter, setFilter] = useState('');
  const {initialState} = useModel('@@initialState');
  const {fullPath} = initialState!.resource;
  const [fullscreen, setFullscreen] = useState(false)
  const [pod, setPod] = useState<CLUSTER.PodInTable>()
  const [selectedPods, setSelectedPods] = useState<CLUSTER.PodInTable[]>([])
  const {successAlert, errorAlert} = useModel('alert')
  const [showEvents, setShowEvents] = useState(false)
  const [showLifeCycle, setShowLifeCycle] = useState(false)
  const [events, setEvents] = useState([])

  const {
    data: podLog,
    run: refreshPodLog,
    cancel: cancelPodLog,
  } = useRequest((podName, containerName) => queryPodStdout(cluster!.id, {
    podName,
    containerName
  }), {
    manual: true,
    ready: !!cluster,
    formatResult: (res) => {
      return res
    },
    pollingInterval: 5000,
  })

  const {
    run: refreshEvents,
    cancel: stopRefreshEvents,
  } = useRequest((podName) => queryPodEvents(cluster!.id, podName), {
    pollingInterval,
    manual: true,
    formatResult: (res: any) => {
      return res
    },
    onSuccess: (eventsResp: any) => {
      setEvents(eventsResp.data.map((v: any, idx: number) => ({
        key: idx,
        type: v.type,
        reason: v.reason,
        message: v.message,
        count: v.count,
        eventTimestamp: Utils.timeToLocal(v.eventTimestamp),
      })))
    }
  })

  const formatMessage = (suffix: string, defaultMsg: string) => {
    return intl.formatMessage({id: `pages.cluster.podsTable.${suffix}`, defaultMessage: defaultMsg})
  }

  const formatConsoleURL = (p: CLUSTER.PodInTable) => {
    const {environment} = cluster?.scope || {}
    return `/clusters${fullPath}/-/webconsole?namespace=${p.namespace}&podName=${p.podName}&containerName=${p.containerName}&environment=${environment}`
  }

  const onClickStdout = (p: CLUSTER.PodInTable) => {
    setFullscreen(true);
    setPod(p)
    refreshPodLog(p.podName, p.containerName).then();
  }

  const onClickMlog = (p: CLUSTER.PodInTable) => {
    const link = `http://music-pylon.hz.netease.com/cmslog-v2/log/list?clusterName=${cluster?.name}&env=${env2MlogEnv.get(cluster?.scope.environment || 'dev')}&hostname=${p.podName}`
    window.open(link)
  }

  const eventTableColumns = [
    {
      title: <span className={styles.tableColumnTitle}>类型</span>,
      dataIndex: 'type',
      key: 'type',
      width: '70px',
      render: (text: any) => {
        if (text === 'Warning') {
          return <span style={{color: 'red'}}>{text}</span>
        }
        return <span style={{color: 'green'}}>{text}</span>
      },
    },
    {
      title: <span className={styles.tableColumnTitle}>原因</span>,
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: <span className={styles.tableColumnTitle}>信息</span>,
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: <span className={styles.tableColumnTitle}>数量</span>,
      dataIndex: 'count',
      key: 'count',
      width: '70px'
    },
    {
      title: <span className={styles.tableColumnTitle}>时间</span>,
      dataIndex: 'eventTimestamp',
      key: 'eventTimestamp',
      width: '200px'
    },
  ]

  const onClickEvents = (p: CLUSTER.PodInTable) => {
    refreshEvents(p.podName).then();
    setShowEvents(true);
  }

  const formatMonitorURL = (p: CLUSTER.PodInTable) => {
    return `/clusters${fullPath}/-/monitoring?podName=${p.podName}`
  }

  const renderPodNameAndIP = (text: string) => {
    if (filter && text.indexOf(filter) > -1) {
      const index = text.indexOf(filter);
      const beforeStr = text.substr(0, index);
      const afterStr = text.substr(index + filter.length);

      return <Tooltip title="单击可复制">
        <span onClick={() => {
          copy(text)
          successAlert('复制成功')
        }}>
          {beforeStr}
          <span style={{color: '#f50'}}>{filter}</span>
          {afterStr}
        </span>
      </Tooltip>
    }

    return <Tooltip title="单击可复制">
        <span onClick={() => {
          copy(text)
          successAlert('复制成功')
        }}>
          {text}
        </span>
    </Tooltip>
  }

  const onChange = (e: any) => {
    const {value} = e.target;
    setFilter(value);
  };

  const hookAfterOnlineOffline = (ops: string, res: any) => {
    const succeedList: string[] = []
    const failedList: {
      name: string,
      err: string,
    }[] = []
    Object.keys(res).forEach(item => {
      const obj: CLUSTER.PodOnlineOfflineResult = res[item]
      if (obj.result) {
        succeedList.push(item)
      } else {
        const errMsg = obj.error?.ErrStatus?.message || obj.stderr || obj.stdout
        failedList.push({
          name: item,
          err: errMsg
        })
      }
    })
    if (failedList.length > 0) {
      errorAlert(<span>{ops}操作执行结果
                  <br/>
                  成功列表:  [ {succeedList.join(",")} ]
                  <br/>
                  失败列表:
                  <br/>
        {failedList.map(item => <div>Pod: {item.name} Error: {item.err}<br/></div>)}
      </span>)
    } else {
      successAlert(<span>{ops}操作执行结果
                  <br/>
                  成功列表: [ {succeedList.join(",")} ]
      </span>)
    }
  }

  const renderTile = () => {
    // @ts-ignore
    return <div><Search placeholder="Search" onChange={onChange} style={{width: '300px'}} value={filter}/>
      <div style={{float: 'right'}}>
        <Button
          onClick={() => {
            online(cluster!.id, selectedPods.map(item => item.podName)).then(({data: d}) => {
              hookAfterOnlineOffline("Online", d)
            });
          }}
          disabled={!selectedPods.length || !RBAC.Permissions.onlineCluster.allowed}
        >
          {formatMessage('online', '上线')}
        </Button>
        <Button
          style={{marginLeft: '10px'}}
          onClick={() => {
            offline(cluster!.id, selectedPods.map(item => item.podName)).then(({data: d}) => {
              hookAfterOnlineOffline("Offline", d)
            });
          }}
          disabled={!selectedPods.length || !RBAC.Permissions.offlineCluster.allowed}
        >
          {formatMessage('offline', '下线')}
        </Button>
      </div>
    </div>
  }

  // 预处理下数据结构
  const postStartHookError = 'PostStartHookError'
  const filteredData = data.filter((item: CLUSTER.PodInTable) => {
    return !filter || item.podName.indexOf(filter) > -1 || item.ip.indexOf(filter) > -1
  }).map(item => {
    const {state} = item
    if (!state.reason) {
      state.reason = state.state
    }

    if (state.state === 'terminated') {
      state.reason = 'terminated';
    }

    if (state.reason.length > postStartHookError.length) {
      state.reason = state.reason.substr(0, postStartHookError.length);
    }

    // change first letter to uppercase
    state.reason = state.reason.slice(0, 1).toUpperCase() + state.reason.slice(1)
    return item;
  })

  const statusList = Array.from(new Set(filteredData.map(item => item.state.reason))).map(item => ({
    text: item,
    value: item,
  }));

  const lifeCycleColumns = [
    {
      title: <span className={styles.tableColumnTitle}>类型</span>,
      dataIndex: 'type',
      key: 'type',
      onHeaderCell: noWrap,
      onCell: noWrap,
    },
    {
      title: <span className={styles.tableColumnTitle}>任务</span>,
      dataIndex: 'task',
      key: 'task',
      onHeaderCell: noWrap,
      onCell: noWrap,
    },
    {
      title: <span className={styles.tableColumnTitle}>信息</span>,
      dataIndex: 'message',
      key: 'message',
    },
  ]

  const podLifeCycleTypeMap = {
    PodSchedule: '节点分配',
    PodInitialize: '环境初始化',
    ContainerStartup: '业务启动及端口检查',
    ContainerOnline: '业务上线',
    HealthCheck: '健康检查',
  }

  const podLifeCycleStatusMap = {
    [LifeCycleItemSuccess]: {
      style: styles.lifecycleStatusSuccess,
      icon: <CheckCircleOutlined/>
    },
    [LifeCycleItemWaiting]: {
      style: styles.lifecycleStatusWaiting,
      icon: <PauseCircleOutlined/>,
    },
    [LifeCycleItemRunning]: {
      style: styles.lifecycleStatusRunning,
      icon: <LoadingOutlined/>,
    },
    [LifeCycleItemAbnormal]: {
      style: styles.lifecycleStatusFailed,
      icon: <CloseCircleOutlined/>
    },
  }


  const [podLifeCycle, setPodLifeCycle] = useState([])
  const onClickLifeCycle = (podInfo: CLUSTER.PodInTable) => {
    const lifeCycle: any = []
    podInfo.lifeCycle.forEach((value) => {
        if (value.message === '') {
          switch (value.status) {
            case LifeCycleItemSuccess:
              value.message = '成功';
              break;
            case LifeCycleItemAbnormal:
              switch (value.type) {
                case 'ContainerStartup':
                  value.message = '启动失败，请检查业务代码或者集群自定义配置（健康检查->port、存活状态）是否正确，具体报错信息可查看日志和events。'
                  break;
                case 'ContainerOnline':
                  value.message = '上线失败，请检查集群自定义配置（健康检查->上线接口）是否正确，具体报错信息可查看events。'
                  break;
                case 'HealthCheck':
                  value.message = '健康检查失败，请检查集群自定义配置（健康检查->存活状态/就绪状态）是否正确，具体报错信息可查看events。'
                  break;
                default:
                  value.message = '执行失败，请联系管理员。'
              }
              break;
            default:
              break;
          }
        }
        lifeCycle.push({
            type: <div
              className={podLifeCycleStatusMap[value.status].style}
            >{value.type}</div>,
            task: <div
              className={podLifeCycleStatusMap[value.status].style}
              key={value.type}
            >
              {podLifeCycleStatusMap[value.status].icon} {podLifeCycleTypeMap[value.type]}
            </div>,
            message: <span className={podLifeCycleStatusMap[value.status].style}> {value.message}</span>
          }
        )
      }
    )
    setPodLifeCycle(lifeCycle);
    setShowLifeCycle(true);
  }
  const columns = [
    {
      title: formatMessage('podName', '副本'),
      dataIndex: 'podName',
      key: 'podName',
      render: (text: any) => renderPodNameAndIP(text)
    },
    {
      title: formatMessage('status', '状态'),
      dataIndex: ['state', 'reason'],
      key: 'status',
      filters: statusList,
      onHeaderCell: noWrap,
      onCell: noWrap,
      onFilter: (value: string, record: CLUSTER.PodInTable) => record.state.reason === value,
      render: (text: string, record: CLUSTER.PodInTable) => {
        const {message} = record.state
        let status = <div></div>
        switch (text) {
          case 'PodInitializing':
            status = <PodPending text={'PodInitializing'} message={message}/>
            break;
          case 'PostStartHookError':
            status = <PodError text={'PostStartHookError'} message={message}/>
            break;
          case 'CrashLoopBackOff':
            status = <PodError text={'CrashLoopBackOff'} message={message}/>
            break;
          case 'Running':
            status = <PodRunning text={'Running'}/>
            break;
          case 'Terminated':
            status = <PodPending text={'Terminated'} message={message}/>
            break;
          default:
            status = <PodPending text={'Pending'}/>
        }
        let lifeCycleButtonStyle = styles.lifecycleButtonBlue
        for (const lifeCycleItem of record.lifeCycle) {
          if (lifeCycleItem.status === LifeCycleItemAbnormal) {
            lifeCycleButtonStyle = styles.lifecycleButtonRed
          }
        }
        return <div>
          {status}
          <Button type={"link"} className={lifeCycleButtonStyle}>
            <Tooltip
              title={'查看状态详情'}
            >
              <EyeOutlined
                onClick={() => {
                  onClickLifeCycle(record)
                }}
                className={styles.lifecycleButtonIcon}
              />
            </Tooltip>
          </Button>
        </div>
      }
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      key: 'ip',
      render: (text: any) => renderPodNameAndIP(text)
    },
    {
      title: formatMessage('onlineStatus', '上线状态'),
      dataIndex: 'onlineStatus',
      key: 'onlineStatus',
      render: (text: string) => status2StateNode.get(text)
    },
    {
      title: formatMessage('restartCount', '重启次数'),
      dataIndex: 'restartCount',
      key: 'restartCount',
    },
    {
      title: '启动时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: formatMessage('action', '操作'),
      key: 'action',
      render: (text: any, record: CLUSTER.PodInTable) => (
        <Space size="middle">
          <Button type={'link'} style={{padding: 0}} disabled={!RBAC.Permissions.createTerminal.allowed}
                  href={formatConsoleURL(record)}
                  target="_blank">Terminal</Button>
          <Button type={'link'} style={{padding: 0}} disabled={!RBAC.Permissions.getContainerLog.allowed}
                  onClick={() => onClickStdout(record)}>Stdout</Button>
          <Button type={'link'} style={{padding: 0}} disabled={!RBAC.Permissions.getContainerLog.allowed}
                  onClick={() => onClickMlog(record)}>查看Mlog</Button>
          <a onClick={() => history.push(formatMonitorURL(record))}>Monitor</a>
          <Button type={'link'} style={{padding: 0}} disabled={!RBAC.Permissions.getClusterStatus.allowed}
                  onClick={() => onClickEvents(record)}>查看events</Button>
        </Space>
      ),
    },
  ]

  const onPodSelected = (selectedRowKeys: React.Key[], selectedRows: CLUSTER.PodInTable[]) => {
    setSelectedPods(selectedRows)
  };

  const onRefreshButtonToggle = (checked: boolean) => {
    if (checked) {
      refreshPodLog(pod?.podName, pod?.containerName).then();
    } else {
      cancelPodLog();
    }
  }

  const locale = {
    emptyText: <NoData title={'Pod'} desc={'你可以对Pod执行一系列操作\n' +
    '比如查看日志、查看基础资源监控、登陆Pod、杀死一个Pod等操作'}/>
  }

  return <div>
    <Table
      rowSelection={{
        type: 'checkbox',
        onChange: onPodSelected
      }}
      // @ts-ignore
      columns={columns}
      dataSource={filteredData}
      locale={locale}
      pagination={{
        position: ['bottomCenter'],
        current: pageNumber,
        hideOnSinglePage: true,
        total: data.length,
        onChange: (page) => setPageNumber(page)
      }}
      title={renderTile}
    />
    <FullscreenModal
      title={'Stdout信息'}
      visible={fullscreen}
      onClose={
        () => {
          setFullscreen(false);
          cancelPodLog();
        }
      }
      fullscreen={false}
      supportFullscreenToggle={true}
      supportRefresh={true}
      onRefreshButtonToggle={onRefreshButtonToggle}
    >
      <CodeEditor
        content={podLog}
      />
    </FullscreenModal>
    {
      <Modal
        title={'Events'}
        visible={showEvents}
        closable={true}
        footer={[]}
        width={'1200px'}
        bodyStyle={{overflow: 'auto'}}
        onCancel={() => {
          stopRefreshEvents();
          setShowEvents(false);
        }}
      >
        <Table
          pagination={
            {
              pageSize: 8
            }
          }
          columns={eventTableColumns}
          dataSource={events}
        />
      </Modal>
    }
    <Modal
      visible={showLifeCycle}
      title={'Pod启动状态详情'}
      footer={[]}
      onCancel={() => {
        setShowLifeCycle(false)
      }}
      width={'800px'}
      centered
    >
      <div>
        <Table
          // @ts-ignore
          columns={lifeCycleColumns}
          dataSource={podLifeCycle}
        />
      </div>
    </Modal>
  </div>
}
