import {Modal, Space, Table, Tabs} from "antd";
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb'
import {useState} from "react";
import {useModel} from "@@/plugin-model/useModel";
import {useRequest} from "@@/plugin-request/request";
import {getPipelines, rollback} from "@/services/clusters/clusters";
import {ExclamationCircleOutlined} from "@ant-design/icons";
import Utils from '@/utils'
import {history} from "@@/core/history";

const {TabPane} = Tabs;

export default () => {
  const {initialState} = useModel('@@initialState');
  const {id, fullPath} = initialState!.resource;
  const {successAlert} = useModel('alert')

  const pageSize = 10;
  const [pageNumber, setPageNumber] = useState(1);

  const {data: pipelines, run} = useRequest(() => {
    return getPipelines(id, {
      pageNumber, pageSize,
    });
  }, {
    refreshDeps: [pageNumber],
  });

  const onRetry = (pipeline: PIPELINES.Pipeline) => {
    Modal.confirm({
      title: '确定要重新执行本次Pipeline？',
      icon: <ExclamationCircleOutlined/>,
      onOk: () => {
        rollback(id, {pipelinerunID: pipeline.id}).then(() => {
          successAlert('提交成功')
          run()
        });
      }
    });
  }

  const columns = [
    {
      title: 'ID',
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
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
      render: (text: any, record: PIPELINES.Pipeline) => (
        <Space size="middle">
          <a onClick={() => onRetry(record)}>Retry</a>
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

  return (
    <PageWithBreadcrumb>
      <Tabs defaultActiveKey={'pipelines'} size={'large'}>
        <TabPane tab={'Pipelines'} key={'pipelines'}>
          <Table
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
        </TabPane>
      </Tabs>
    </PageWithBreadcrumb>
  )
}
