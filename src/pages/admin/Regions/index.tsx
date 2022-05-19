import {Button, Table, Divider} from "antd";
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb'
import {useRequest} from "@@/plugin-request/request";
import NoData from "@/components/NoData";
import {queryRegions} from "@/services/regions/regions";

export default () => {
  const columns = [
    {
      title: '区域名',
      dataIndex: 'displayName',
      key: 'displayName',
    },
    {
      title: 'server',
      dataIndex: 'server',
      key: 'server',
    },
    {
      title: 'ingress域名',
      dataIndex: 'ingressDomain',
      key: 'ingressDomain',
    },
    {
      title: 'harbor',
      dataIndex: 'harborName',
      key: 'harborName',
    },
    {
      title: '操作',
      key: "operation",
      render: () => {
        return <div>
          <a onClick={() => {}}>
            编辑
          </a>
          <Divider type="vertical" />
          <a onClick={() => {}}>
            删除
          </a>
        </div>
      }
    }
  ]

  const {data: regions} = useRequest(() => queryRegions(), {
  });

  const queryInput = (
    // @ts-ignore
    <div>
      {
        <Button
          type="primary"
          style={{marginBottom: 10}}
          onClick={() => {

          }}
        >
          创建区域
        </Button>
      }
    </div>
  )

  const locale = {
    emptyText: <NoData title={'区域'} desc={
      '区域指应用集群可供选择的部署目的地，需配置该区域对应的计算K8S信息'}
    />
  }

  const table = <Table
    columns={columns}
    dataSource={regions}
    locale={locale}
  />

  return (
    <PageWithBreadcrumb>
      {queryInput}
      {table}
    </PageWithBreadcrumb>
  )
}
