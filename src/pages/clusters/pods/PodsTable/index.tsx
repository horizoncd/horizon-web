import {Button, Input, Space, Table} from "antd";
import {useIntl} from "@@/plugin-locale/localeExports";
import {useState} from "react";

const {Search} = Input;

export default (props: any) => {
  const {data} = props;
  const intl = useIntl();
  const [pageNumber, setPageNumber] = useState(1);
  const [filter, setFilter] = useState('');

  const formatMessage = (suffix: string, defaultMsg: string) => {
    return intl.formatMessage({id: `pages.cluster.podsTable.${suffix}`, defaultMessage: defaultMsg})
  }

  const columns = [
    {
      title: formatMessage('podName', '副本'),
      dataIndex: 'podName',
      key: 'podName',
    },
    {
      title: formatMessage('status', '状态'),
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      key: 'ip',
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
      title: 'createTime',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: formatMessage('action', '操作'),
      key: 'action',
      render: (text: any, record: any) => (
        <Space size="middle">
          <a>登录Terminal</a>
          <a>查看容器日志</a>
        </Space>
      ),
    },
  ]

  const onChange = (e: any) => {
    const {value} = e.target;
    setFilter(value);
  };

  const renderTile = () => {
    return <div>
      <Search placeholder="Search" onChange={onChange}/>

      <div style={{float: 'right'}}>
        <Button
          type="primary"
          onClick={() => {

          }}
        >
          {formatMessage('online', '上线')}
        </Button>
        <Button
          type="primary"
          style={{marginRight: '10px'}}
          onClick={() => {

          }}
        >
          {formatMessage('offline', '下线')}
        </Button>
      </div>

    </div>
  }

  const filteredData = data.filter((item: any) => {
    return !filter || item.podName.contains(filter)
  })

  return <Table
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

}
