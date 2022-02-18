import {Button, Input, Menu, Modal, Space, Table, Tooltip} from "antd";
import {useIntl} from "@@/plugin-locale/localeExports";
import React, {useState} from "react";
import {useModel} from "@@/plugin-model/useModel";
import './index.less'
import FullscreenModal from "@/components/FullscreenModal";
import {useRequest} from "@@/plugin-request/request";
import {offline, online, queryPodContainers, queryPodEvents, queryPodStdout} from "@/services/clusters/pods";
import CodeEditor from '@/components/CodeEditor'
import {history} from 'umi';
import NoData from "@/components/NoData";
import copy from "copy-to-clipboard";
import {Offline, Online, PodError, PodPending, PodRunning} from '@/components/State'
import RBAC from '@/rbac'
import withTrim from "@/components/WithTrim";
import CollapseList from '@/components/CollapseList'
import type {Param} from '@/components/DetailCard';
import DetailCard from '@/components/DetailCard'
import styles from './index.less'
import Utils from '@/utils'
import {env2MlogEnv} from "@/const";
import Dropdown from "antd/es/dropdown";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownOutlined,
  EyeOutlined,
  LoadingOutlined,
  MinusSquareTwoTone,
  PauseCircleOutlined,
  PlusSquareTwoTone,
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
  const [currentContainer, setCurrentContainer] = useState<CLUSTER.ContainerDetail>()
  const [selectedPods, setSelectedPods] = useState<CLUSTER.PodInTable[]>([])
  const {successAlert, errorAlert} = useModel('alert')
  const [showEvents, setShowEvents] = useState(false)
  const [showLifeCycle, setShowLifeCycle] = useState(false)
  const [showContainerDetail, setShowContainerDetail] = useState(false)
  const [events, setEvents] = useState([])
  const [podLog, setPodLog] = useState("")
  const [autoRefreshPodLog, setAutoRefreshPodLog] = useState(true)

  const {
    data: podLogInterval,
    run: refreshPodLog,
    cancel: cancelPodLog,
  } = useRequest((podName, containerName) => queryPodStdout(cluster!.id, {
    podName,
    containerName,
  }), {
    manual: true,
    ready: !!cluster,
    formatResult: (res) => {
      return res
    },
    pollingInterval: 5000,
    onSuccess: () => {
      setPodLog(podLogInterval)
    }
  })

  const {
    data: podLogOnce,
    run: refreshPodLogOnce,
  } = useRequest((podName, containerName) => queryPodStdout(cluster!.id, {
    podName,
    containerName,
  }), {
    manual: true,
    ready: !!cluster,
    formatResult: (res) => {
      return res
    },
    onSuccess: () => {
      setPodLog(podLogOnce)
    }
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

    if (item.deletionTimestamp) {
      state.state = 'terminated'
    }

    if (state.state === 'terminated') {
      state.reason = 'terminated';
    }

    if (state.reason.length > postStartHookError.length) {
      state.reason = state.reason.substr(0, postStartHookError.length);
    }

    // change first letter to uppercase
    state.reason = state.reason.slice(0, 1).toUpperCase() + state.reason.slice(1)

    for (const k in item.annotations) {
      if (!k.startsWith("cloudnative.music.netease.com/git")) {
        delete item.annotations[k]
      }
    }
    return item;
  }).sort((a: CLUSTER.PodInTable, b: CLUSTER.PodInTable) => {
    if (a.createTime < b.createTime) {
      return 1;
    }
    if (a.createTime > b.createTime) {
      return -1;
    }

    return 0;
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
    PreStop: '应用下线',
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
            case LifeCycleItemRunning:
              switch (value.type) {
                case 'PreStop':
                  value.message = '应用正在下线中，若耗时较长，请检查集群自定义配置（健康检查->下线接口）是否配置有误。'
                  break;
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

  const otherOperations = (record: CLUSTER.PodInTable) => (<Menu>
      <Menu.Item disabled={!RBAC.Permissions.getContainerLog.allowed}
                 onClick={() => onClickStdout(record)}>
        <div style={{color: "#1890ff"}}>Stdout</div>
      </Menu.Item>
      <Menu.Item disabled={!RBAC.Permissions.getContainerLog.allowed}
                 onClick={() => onClickMlog(record)}>
        <div style={{color: "#1890ff"}}>Mlog</div>
      </Menu.Item>
      <Menu.Item disabled={!RBAC.Permissions.getEvents.allowed}
                 onClick={() => onClickEvents(record)}>
        <div style={{color: "#1890ff"}}>Events</div>
      </Menu.Item>
    </Menu>
  )

  // @ts-ignore
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
      width: '90px',
      dataIndex: 'restartCount',
      key: 'restartCount',
    },
    {
      title: '注释',
      dataIndex: 'annotations',
      key: 'annotations',
      width: '26%',
      render: (text: any, record: CLUSTER.PodInTable) => {
        // return <collapseList defaultCount={2} data={record.annotations}/>
        return <div>
          <CollapseList defaultCount={2} data={record.annotations}/>
        </div>
      },
    },
    {
      title: '启动时间',
      dataIndex: 'createTime',
      width: "110px",
      key: 'createTime',
      // defaultSortOrder: 'descend',
      // sortDirections: ['ascend', 'descend', 'ascend'],
      // sorter: (a: CLUSTER.PodInTable, b: CLUSTER.PodInTable) => {
      //   if (a.createTime < b.createTime) {
      //     return -1;
      //   }
      //   if (a.createTime > b.createTime) {
      //     return 1;
      //   }
      //
      //   return 0;
      // },
    },
    {
      title: formatMessage('action', '操作'),
      key: 'action',
      render: (text: any, record: CLUSTER.PodInTable) => (
        <Space size='small' style={{maxWidth: '200px', whiteSpace: 'nowrap'}}>
          <Button type={'link'} style={{padding: 0}} disabled={!RBAC.Permissions.createTerminal.allowed}
                  href={formatConsoleURL(record)}
                  target="_blank">Terminal</Button>
          <a onClick={() => history.push(formatMonitorURL(record))}>Monitor</a>
          <Dropdown trigger={['click']} overlay={otherOperations(record)}>
            <a>
              更多操作 <DownOutlined/>
            </a>
          </Dropdown>
        </Space>
      ),
    },
  ]

  const onPodSelected = (selectedRowKeys: React.Key[], selectedRows: CLUSTER.PodInTable[]) => {
    setSelectedPods(selectedRows)
  };

  const onRefreshButtonToggle = (checked: boolean) => {
    setAutoRefreshPodLog(checked)
    if (checked) {
      refreshPodLog(pod?.podName, pod?.containerName).then();
    } else {
      cancelPodLog();
    }
  }

  const locale = {
    emptyText: <NoData title={'Pod'} desc={'你可以对Pod执行一系列操作\n' +
    '比如查看日志、查看基础资源监控、登陆Pod等'}/>
  }

  const [containersCache, setContainersCache] = useState<Record<string, any[]>>({})
  const containerDetail: Param[][] = [[]]
  if (currentContainer?.status) {
    const stateKey = Object.keys(currentContainer?.status.state)
    if (stateKey.length > 0) {
      containerDetail[0].push(
        {
          key: "Status",
          value: stateKey[0],
        }
      )
    }
    if (currentContainer?.status.state.waiting) {
      containerDetail[0].push(
        {
          key: "Reason",
          value: currentContainer?.status.state.waiting.reason,
        })
    } else if (currentContainer?.status.state.terminated) {
      containerDetail[0].push(
        {
          key: "Reason",
          value: currentContainer?.status.state.terminated.reason,
        },
        {
          key: "Message",
          value: currentContainer?.status.state.terminated.message,
        },
      )
    }
  }

  containerDetail[0].push(
    {key: "Ready", value: currentContainer?.status.ready.toString()},
    {key: "Started", value: currentContainer?.status.started.toString()},
  )
  containerDetail.push([{key: "Image", value: currentContainer?.image}])


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
      expandable={{
        expandedRowRender: (record) => {
          if (!containersCache[record.podName]) {
            return <div/>
          }

          return <Table
            columns={
              [
                {
                  title: "容器名称",
                  dataIndex: 'name',
                  width: '15%',
                  key: 'name',
                  render: (text: string, container: CLUSTER.ContainerDetail) => {
                    return <Button
                      type={'link'}
                      onClick={
                        () => {
                          setCurrentContainer(container);
                          setShowContainerDetail(true);
                        }}
                    >
                      {text}
                    </Button>
                  }
                },
                {
                  title: "镜像",
                  dataIndex: 'image',
                  key: 'image',
                  width: '50%'
                },
                {
                  title: "状态",
                  dataIndex: 'status',
                  key: 'status',
                  width: '5%',
                  render: (text: string, container: CLUSTER.ContainerDetail) => {
                    if (!container.status) {
                      return <div/>
                    }
                    const stateKey = Object.keys(container.status.state)
                    if (stateKey.length == 0) {
                      return <div/>
                    }
                    switch (stateKey[0]) {
                      case 'running':
                        return <PodRunning text={'Running'}/>
                      case 'terminated':
                        return <PodError text={'Terminated'}/>
                      default:
                        return <PodPending text={'Waiting'}/>
                    }
                  }
                },
                {
                  title: "重启次数",
                  dataIndex: 'restartCount',
                  key: 'restartCount',
                  width: '10%',
                  render: (text: string, container: CLUSTER.ContainerDetail) => {
                    let cnt = 0
                    if (container.status) {
                      cnt = container.status.restartCount
                    }
                    return <div>{cnt}</div>
                  }
                },
                {
                  title: "启动时间",
                  dataIndex: 'startedAt',
                  key: 'startedAt',
                  width: '20%',
                  render: (text: string, container: CLUSTER.ContainerDetail) => {
                    if (!container.status) {
                      return <div/>
                    }

                    if (container.status.state.running) {
                      return <div>{container.status.state.running.startedAt}</div>
                    } else if (container.status.state.terminated) {
                      return <div>{container.status.state.terminated.startedAt}</div>
                    }
                    return <div/>
                  }
                },
              ]
            }
            pagination={{
              hideOnSinglePage: true
            }}
            dataSource={containersCache[record.podName]}
            rowKey={(container) => {
              return container.name
            }}
          />
        },
        onExpand: (expanded, record) => {
          if (expanded) {
            queryPodContainers(cluster!.id, {podName: record.podName}).then((result) => {
              const containersCacheNew = Object.create(containersCache)
              const containers: any[] = []
              result.data.forEach((container: CLUSTER.ContainerDetail) => {
                containers.push(container)
              })
              containersCacheNew[record.podName] = containers
              setContainersCache(containersCacheNew)
            });
          }
        },
        expandIcon: ({expanded, onExpand, record}) =>
          expanded ? (
            <MinusSquareTwoTone className={styles.expandedIcon} onClick={e => onExpand(record, e)}/>
          ) : (
            <PlusSquareTwoTone className={styles.expandedIcon} onClick={e => onExpand(record, e)}/>
          )
      }}
    />
    <FullscreenModal
      title={'Stdout信息'}
      visible={fullscreen}
      listToSelect={pod?.containers.map((container) => {
        return container.name
      })}
      onSelectChange={(value: string) => {
        if (pod) {
          const newPod = Object.create(pod)
          newPod.containerName = value
          setPod(newPod)
          if (autoRefreshPodLog) {
            cancelPodLog();
            refreshPodLog(pod.podName, value).then();
          } else {
            refreshPodLogOnce(pod.podName, value).then();
          }
        }
      }}

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
      title={'Pod状态详情'}
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
    {
      currentContainer && <Modal
        visible={showContainerDetail}
        title={<span className={styles.containerDetailHeading}>容器详情</span>}
        footer={[]}
        onCancel={() => {
          setShowContainerDetail(false)
        }}
        width={'1000px'}
        centered
        bodyStyle={{height: '600px', overflowY: 'auto'}}
      >
        <DetailCard
          title={<span className={styles.containerDetailHeading}>状态</span>}
          data={containerDetail}
        />
        <span className={styles.containerDetailHeading}>环境变量</span>
        <Table
          className={styles.containerDetailTable}
          pagination={
            {
              pageSize: 20,
              hideOnSinglePage: true,
            }
          }
          columns={[
            {
              title: "名称",
              dataIndex: 'name',
              key: 'name',
            },
            {
              title: "值",
              dataIndex: 'value',
              key: 'value',
            },
          ]}
          dataSource={currentContainer?.env ? currentContainer?.env.filter(
            (env: any) => {
              return env.value
            }
          ) : []}
          rowKey={(env) => {
            return env.name
          }}
        >
        </Table>
        <span className={styles.containerDetailHeading}>存储挂载</span>
        <Table
          className={styles.containerDetailTable}
          pagination={
            {
              pageSize: 20,
              hideOnSinglePage: true,
            }
          }
          columns={[
            {
              title: "名称",
              dataIndex: 'name',
              key: 'name',
            },
            {
              title: "只读",
              dataIndex: 'readOnly',
              key: 'readOnly',
              render: (value: any) => {
                return <span>{value.toString()}</span>
              }
            },
            {
              title: "挂载路径",
              dataIndex: 'mountPath',
              key: 'mountPath',
            },
            {
              title: "子路径",
              dataIndex: 'subPath',
              key: 'subPath',
            },
            {
              title: "挂载类型",
              dataIndex: 'volumeType',
              key: 'volumeType',
              render: (text: string, volumeMount: CLUSTER.VolumeMount) => {
                const volumes = Object.keys(volumeMount.volume)
                if (volumes.length < 2) {
                  return <div/>
                }
                return <span>{volumes[1]}</span>
              }
            },
          ]}
          dataSource={currentContainer?.volumeMounts ? currentContainer?.volumeMounts : []}
          rowKey={(volumeMount) => {
            return volumeMount.name
          }}
        >
        </Table>
      </Modal>
    }
  </div>
}
