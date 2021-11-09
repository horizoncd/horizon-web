import {Input, Modal, notification, Space, Table, Tabs} from "antd";
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb'
import {useState} from "react";
import {useModel} from "@@/plugin-model/useModel";
import styles from './index.less'
import {useRequest} from "@@/plugin-request/request";
import {getPipelines, rollback} from "@/services/clusters/clusters";
import {ExclamationCircleOutlined} from "@ant-design/icons";

const {TabPane} = Tabs;
const {Search} = Input;

export default () => {
  const {initialState} = useModel('@@initialState');
  const {id, fullPath} = initialState!.resource;

  const pageSize = 10;

  const [filter, setFilter] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [query, setQuery] = useState(0);

  const {data: pipelines, run} = useRequest(() => {
    return getPipelines(id, {
      filter, pageNumber, pageSize,
    });
  }, {
    refreshDeps: [query, pageNumber],
  });

  const onRetry = (pipeline: PIPELINES.Pipeline) => {
    Modal.confirm({
      title: '确定要重新执行本次Pipeline？',
      icon: <ExclamationCircleOutlined/>,
      onOk: () => {
        rollback(id, {pipelinerunID: pipeline.id}).then(() => {
          notification.success({
            message: '提交成功'
          })
          run()
        });
      }
    });
  }

  const columns = [
    {
      title: 'Pipeline',
      dataIndex: 'id',
      key: 'id',
      render: (text: any) => (
        <Space size="middle">
          <a href={`/clusters${fullPath}/-/pipelines/${text}`}>{text}</a>
        </Space>
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Trigger',
      dataIndex: 'trigger',
      key: 'trigger',
    },
    {
      title: 'CreateTime',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: 'Operations',
      key: 'operations',
      render: (text: any, record: PIPELINES.Pipeline) => (
        <Space size="middle">
          <a onClick={() => onRetry(record)}>Retry</a>
        </Space>
      ),
    },
  ];

  const onChange = (e: any) => {
    const {value} = e.target;
    setFilter(value);
  };

  const onPressEnter = () => {
    setQuery(prev => prev + 1)
  }

  const onSearch = () => {
    setQuery(prev => prev + 1)
  }
  const queryInput = (
    <div>
      <Search className={styles.antInputGroupWrapper} placeholder="Search" onPressEnter={onPressEnter}
              onSearch={onSearch}
              onChange={onChange}/>
    </div>
  )

  // const data = pipelines?.items.map(item => {
  //   return item
  // })

  return (
    <PageWithBreadcrumb>
      <Tabs defaultActiveKey={'pipelines'} size={'large'} tabBarExtraContent={queryInput}>
        <TabPane tab={'Pipelines'} key={'pipelines'}>
          <Table
            columns={columns}
            dataSource={[
              {
                status: 'ok',
                id: 123,
                createdBy: 'tony',
                startedAt: '2021-11-02',
                action: 'Deploy',
                title: 'publish',
              }
            ]}
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
