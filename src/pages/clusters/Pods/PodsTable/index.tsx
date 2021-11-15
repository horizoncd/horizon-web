import {Button, Input, Space, Table} from "antd";
import {useIntl} from "@@/plugin-locale/localeExports";
import React, {useState} from "react";
import {useModel} from "@@/plugin-model/useModel";
import './index.less'
import FullscreenModal from "@/components/FullscreenModal";
import {useRequest} from "@@/plugin-request/request";
import {queryPodStdout, online, offline} from "@/services/clusters/pods";
import CodeEditor from '@/components/CodeEditor'
import {history} from 'umi';

const {Search} = Input;

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

  const {
    data: podLog,
    run: refreshPodLog,
    cancel: cancelPodLog,
  } = useRequest((podName, containerName) => queryPodStdout(cluster.id, {
    podName: podName,
    containerName: containerName
  }), {
    manual: true,
    formatResult: (res) => {
      return res
    },
    pollingInterval: 5000,
  })

  const formatMessage = (suffix: string, defaultMsg: string) => {
    return intl.formatMessage({id: `pages.cluster.podsTable.${suffix}`, defaultMessage: defaultMsg})
  }

  const formatConsoleURL = (pod: CLUSTER.PodInTable) => {
    const {environment} = cluster?.scope || {}
    return `/clusters${fullPath}/-/webconsole?namespace=${pod.namespace}&podName=${pod.podName}&
    containerName=${pod.containerName}&environment=${environment}`
  }

  const onClickStdout = (pod: CLUSTER.PodInTable) => {
    setFullscreen(true);
    setPod(pod)
    refreshPodLog(pod.podName, pod.containerName).then();
  }

  const formatMonitorURL = (pod: CLUSTER.PodInTable) => {
    return `/clusters${fullPath}/-/monitoring?podName=${pod.podName}`
  }

  const renderPodNameAndIP = (text: string) => {
    if (filter && text.indexOf(filter) > -1) {
      const index = text.indexOf(filter);
      const beforeStr = text.substr(0, index);
      const afterStr = text.substr(index + filter.length);

      return <span>
          {beforeStr}
        <span style={{color: '#f50'}}>{filter}</span>
        {afterStr}
        </span>
    }

    return text
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
      dataIndex: 'status',
      key: 'status',
      filters: [
        {
          text: 'running',
          value: 'running',
        },
        {
          text: 'pending',
          value: 'pending',
        },
      ],
      onFilter: (value: string, record: CLUSTER.PodInTable) => record.status === value,
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
          <a href={formatConsoleURL(record)} target="_blank">Terminal</a>
          <a onClick={() => onClickStdout(record)}>查看日志</a>
          <a onClick={() => history.push(formatMonitorURL(record))}>Monitor</a>
        </Space>
      ),
    },
  ]

  const onChange = (e: any) => {
    const {value} = e.target;
    setFilter(value);
  };

  const hookAfterOnlineOffline = (ops: string, res: any) => {
    const succeedList: string[] = []
    const failedList: string[] = []
    Object.keys(res).forEach(item => {
      const obj = res[item]
      if (obj.result) {
        succeedList.push(item)
      } else {
        failedList.push(item)
      }
    })
    if (failedList.length > 0) {
      errorAlert(`${ops}操作执行结果\n成功列表: [ ${succeedList.join(",")} ]\n失败列表: [ ${failedList.join(",")} ]`)
    }
  }

  const renderTile = () => {
    return <div>
      <Search placeholder="Search" onChange={onChange} style={{width: '300px'}}/>

      <div style={{float: 'right'}}>
        <Button
          type="primary"
          onClick={() => {
            online(cluster!.id, selectedPods.map(item => item.podName)).then(({data: d}) => {
              hookAfterOnlineOffline("Online", d)
            });
          }}
          disabled={!selectedPods.length}
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
          disabled={!selectedPods.length}
        >
          {formatMessage('offline', '下线')}
        </Button>
        <Button
          style={{marginLeft: '10px'}}
          onClick={() => {

          }}
          disabled={!selectedPods.length}
        >
          {formatMessage('restartPod', '重启Pod')}
        </Button>
      </div>
    </div>
  }
  const filteredData = data.filter((item: CLUSTER.PodInTable) => {
    return !filter || item.podName.indexOf(filter) > -1 || item.ip.indexOf(filter) > -1
  })

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

  return <div>
    <Table
      rowSelection={{
        type: 'checkbox',
        onChange: onPodSelected
      }}
      // @ts-ignore
      columns={columns}
      dataSource={filteredData}
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
  </div>
}
