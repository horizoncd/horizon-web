import {Button, Modal, Space, Table, Tabs} from "antd";
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb'
import {useState} from "react";
import {useModel} from "@@/plugin-model/useModel";
import {useRequest} from "@@/plugin-request/request";
import {getPipelines, rollback} from "@/services/clusters/clusters";
import {ExclamationCircleOutlined} from "@ant-design/icons";
import Utils from '@/utils'
import {history} from "@@/core/history";
import {Failed, Succeeded} from "@/components/State";
import RBAC from '@/rbac'

const {TabPane} = Tabs;

export default (props: any) => {
  const {location} = props;
  const {query} = location;
  // 1. all 2. rollback
  const {category = 'all'} = query

  const {initialState} = useModel('@@initialState');
  const {id, fullPath} = initialState!.resource;
  const {successAlert} = useModel('alert')

  const pageSize = 10;
  const [pageNumber, setPageNumber] = useState(1);
  const [tabKey, setTabKey] = useState(category);

  const {data: pipelines} = useRequest(() => {
    return getPipelines(id, {
      pageNumber, pageSize, canRollback: category === 'rollback'
    });
  }, {
    refreshDeps: [pageNumber, tabKey],
  });

  const onRetry = (pipeline: PIPELINES.Pipeline) => {
    Modal.confirm({
      title: '确定要重新执行本次Pipeline？',
      icon: <ExclamationCircleOutlined/>,
      onOk: () => {
        rollback(id, {pipelinerunID: pipeline.id}).then(() => {
          successAlert('提交回滚成功')
          // jump to pods' url
          history.push(`/clusters${fullPath}/-/pods`)
        });
      }
    });
  }

  const columns = [
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text: string, record: PIPELINES.Pipeline) => {
        return text === 'ok' ? <Succeeded link={`/clusters${fullPath}/-/pipelines/${record.id}`} text="Passed"/> :
          <Failed link={`/clusters${fullPath}/-/pipelines/${record.id}`}/>
      }
    },
    {
      title: 'Pipeline',
      dataIndex: 'key',
      key: 'key',
      render: (text: any) => (
        <Space size="middle">
          <a onClick={() => history.push(`/clusters${fullPath}/-/pipelines/${text}`)}>{text}</a>
        </Space>
      ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '触发者',
      dataIndex: 'trigger',
      key: 'trigger',
    },
    {
      title: '触发类型',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: '创建时间',
      dataIndex: 'startedAt',
      key: 'startedAt',
    },
    {
      title: '操作',
      key: 'operations',
      render: (text: string, record: PIPELINES.Pipeline) => (
        record.canRollback && <Space size="middle">
          <Button type={'link'} style={{padding: 0}}
                  disabled={!RBAC.Permissions.rollbackCluster.allowed}
                  onClick={() => onRetry(record)}>Retry</Button>
        </Space>
      ),
    },
  ];

  const datasource = pipelines?.items?.map(item => ({
    ...item,
    key: item.id,
    trigger: item.createdBy.userName,
    startedAt: Utils.timeToLocal(item.startedAt)
  }))

  const table = <Table
    columns={columns}
    dataSource={datasource}
    pagination={{
      position: ['bottomCenter'],
      current: pageNumber,
      hideOnSinglePage: true,
      pageSize,
      total: pipelines?.total,
      onChange: (page) => setPageNumber(page)
    }}
  />

  return (
    <PageWithBreadcrumb>
      <Tabs size={'large'} activeKey={tabKey} onChange={(key) => {
        history.replace(`/clusters${fullPath}/-/pipelines?category=${key}`)
        setTabKey(key)
      }} animated={false}>
        <TabPane tab={'所有'} key={'all'}>
          {table}
        </TabPane>
        <TabPane tab={'可回滚'} key={'rollback'}>
          {table}
        </TabPane>
      </Tabs>
    </PageWithBreadcrumb>
  )
}
