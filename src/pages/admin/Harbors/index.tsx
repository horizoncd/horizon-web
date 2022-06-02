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
      title: 'id',
      dataIndex: 'id',
      render: (id: number) => {
        return <Space size="middle">
          <a onClick={() => history.push(`/admin/harbors/${id}`)}>{id}</a>
        </Space>
      }
    },
    {
      title: 'name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'server',
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
    emptyText: <NoData title={'区域'} desc={
      '区域指应用集群可供选择的部署目的地，需配置该区域对应的计算K8S信息'}
    />
  }

  const table = <Table
    columns={columns}
    dataSource={harbors}
    locale={locale}
    pagination={false}
  />

  return (
    <PageWithBreadcrumb>
      {queryInput}
      {table}
    </PageWithBreadcrumb>
  )
}
