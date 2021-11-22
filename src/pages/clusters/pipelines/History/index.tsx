import {Button, Modal, Space, Table, Tabs} from "antd";
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb'
import {useState} from "react";
import {useModel} from "@@/plugin-model/useModel";
import {useRequest} from "@@/plugin-request/request";
import {getPipelines, rollback} from "@/services/clusters/clusters";
import {ExclamationCircleOutlined} from "@ant-design/icons";
import Utils from '@/utils'
import {history} from 'umi';
import {Failed, NotFount, Progressing, Succeeded, Cancelled} from "@/components/State";
import {DeployTypeMap} from '@/const'
import RBAC from '@/rbac'

const {TabPane} = Tabs;

export default (props: any) => {
  const {location} = props;
  const {query} = location;
  // 1. all 2. rollback
  const {category = 'all'} = query

  const {initialState} = useModel('@@initialState');
  const {id, fullPath} = initialState!.resource;

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
      title: '确定要重新执行本次Pipeline？点击确定进入详情页进行二次确认',
      icon: <ExclamationCircleOutlined/>,
      onOk: () => {
        rollback(id, {pipelinerunID: pipeline.id}).then(() => {
          history.push(`/clusters${fullPath}/-/pipelines/${pipeline.id}?rollback=true`)
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
        const link = `/clusters${fullPath}/-/pipelines/${record.id}`
        switch (text) {
          case 'ok':
            return <Succeeded link={link} text="Passed"/>
          case 'failed':
            return <Failed link={link}/>
          case 'created':
            return  <Progressing link={link} text={'Created'}/>
          case 'cancelled':
            return <Cancelled link={link}/>
          default:
            return <NotFount link={link}/>
        }
      }
    },
    {
      title: 'Pipeline',
      dataIndex: 'key',
      key: 'key',
      render: (text: any) => (
        <Space size="middle">
          <a onClick={() => history.push(`/clusters${fullPath}/-/pipelines/${text}`)}>#{text}</a>
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
      render: (text: any) => DeployTypeMap.get(text)
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
                  onClick={() => onRetry(record)}>回滚到此版本</Button>
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
