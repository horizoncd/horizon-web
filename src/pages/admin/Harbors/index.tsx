import {Button, Space, Table} from "antd";
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb'
import {useRequest} from "@@/plugin-request/request";
import NoData from "@/components/NoData";
import {queryHarbors} from "@/services/harbors/harbors";
import {history} from 'umi';
import Utils from "@/utils";

export default () => {
  const {data: harbors} = useRequest(() => queryHarbors(), {});

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, r: SYSTEM.Harbor) => {
        return <Space size="middle">
          <a onClick={() => history.push(`/admin/harbors/${r.id}`)}>{name}</a>
        </Space>
      }
    },
    {
      title: '域名',
      dataIndex: 'server',
      key: 'server',
    },
    {
      title: '镜像预热ID',
      dataIndex: 'preheatPolicyID',
      key: 'preheatPolicyID',
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
        history.push(`/admin/harbors/new`)
      }}
    >
      创建Harbor
    </Button>
  )

  const locale = {
    emptyText: <NoData title={'Harbor'} desc={
      'harbor是一个镜像中心服务，负责存储和分发容器镜像'}
    />
  }

  const table = <Table
    columns={columns}
    dataSource={harbors}
    locale={locale}
    pagination={{
      position: ['bottomCenter'],
      hideOnSinglePage: true,
      total: harbors?.length,
      pageSize: 7
    }}  />

  return (
    <PageWithBreadcrumb>
      {queryInput}
      {table}
    </PageWithBreadcrumb>
  )
}
