import {Button, Space, Table} from "antd";
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb'
import {useRequest} from "@@/plugin-request/request";
import NoData from "@/components/NoData";
import {
  queryRegions,
} from "@/services/kubernetes/kubernetes";
import CollapseList from "@/components/CollapseList";
import {history} from "@@/core/history";
import Utils from "@/utils";

export default () => {
  const {data: regions} = useRequest(() => queryRegions(), {});

  const columns = [
    {
      title: 'id',
      dataIndex: 'id',
      render: (id: number) => {
        return <Space size="middle">
          <a onClick={() => history.push(`/admin/kubernetes/${id}`)}>{id}</a>
        </Space>
      }
    },
    {
      title: '名称',
      dataIndex: 'displayName',
    },
    {
      title: 'server',
      dataIndex: 'server',
    },
    {
      title: '标签',
      width: '150px',
      dataIndex: 'tags',
      render: (tags: [API.Tag]) => {
        if (tags) {
          const data = {};
          for (const tag of tags) {
            data[tag.key] = tag.value
          }
          return <CollapseList defaultCount={2} data={data}/>
        }
        return ""
      }
    },
    {
      title: '启用状态',
      width: '80px',
      dataIndex: 'disabled',
      render: (disabled: boolean) => {
        return disabled ? <span style={{color: 'red'}}>已禁用</span> : "启用中"
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      render: (v: string) => {
        return Utils.timeToLocal(v)
      }
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      render: (v: string) => {
        return Utils.timeToLocal(v)
      }
    }
  ]

  const queryInput = (
    <Button
      type="primary"
      style={{marginBottom: 10, float: 'right', marginRight: 5}}
      onClick={() => {
        history.push(`/admin/kubernetes/new`)
      }}
    >
      创建区域
    </Button>
  )

  const locale = {
    emptyText: <NoData title={'区域'} desc={
      '区域指应用集群可供选择的部署目的地，需配置该区域对应的计算K8S信息'}
    />
  }

  const table = <Table
    rowKey={'id'}
    columns={columns}
    dataSource={regions}
    locale={locale}
    pagination={{
      position: ['bottomCenter'],
      hideOnSinglePage: true,
      total: regions?.length,
      pageSize: 7
    }}
  />

  return (
    <PageWithBreadcrumb>
      {queryInput}
      {table}
    </PageWithBreadcrumb>
  )
}
