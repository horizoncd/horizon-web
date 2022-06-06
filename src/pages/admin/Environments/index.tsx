import {Button, Space, Table} from "antd";
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb'
import {useRequest} from "@@/plugin-request/request";
import NoData from "@/components/NoData";
import {queryEnvironments} from "@/services/environments/environments";
import {
  queryEnvironmentRegions,
} from "@/services/environmentregions/environmentregions";
import {useState} from "react";
import dashboardStyles from '../../dashboard/index.less';
import {history} from "@@/core/history";
import Utils from "@/utils";

export default () => {
  const [envToRegions, setEnvToRegions] = useState<Map<string, SYSTEM.EnvironmentRegion[]>>(new Map());

  const columns = [
    {
      title: 'id',
      dataIndex: 'id',
      render: (id: number) => {
        return <Space size="middle">
          <a onClick={() => history.push(`/admin/environments/${id}`)}>{id}</a>
        </Space>
      }
    },
    {
      title: '环境',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '环境名',
      dataIndex: 'displayName',
      key: 'displayName',
    },
    {
      title: 'Kubernetes',
      dataIndex: 'regionTexts',
      key: 'regionTexts',
      render: (text: any) => {
        return text
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

  const {data: environments = []} = useRequest(() => queryEnvironments());
  const {data: environmentRegions = []} = useRequest(() => queryEnvironmentRegions(""), {
    onSuccess: () => {
      const m = new Map<string, SYSTEM.EnvironmentRegion[]>();
      for (let i = 0; i < environmentRegions.length; i++) {
        const env = environmentRegions[i].environmentName
        const v = m.get(env)
        if (!v) {
          m.set(env, [environmentRegions[i]])
        } else {
          v.push(environmentRegions[i])
        }
      }
      setEnvToRegions(m)
    },
    ready: environments.length > 0
  });

  const queryInput = (
    <Button
      type="primary"
      style={{marginBottom: 10, float: 'right', marginRight: 5}}
      onClick={() => {
        history.push(`/admin/environments/new`)
      }}
    >
      创建环境
    </Button>
  )

  const dataSource = environments.map(item => {
    const r = envToRegions.get(item.name);
    if (r) {
      const regionTexts = r.map((region, index) => {
        return <span key={region.regionName}>
          {region.regionDisplayName}
          {
            region.isDefault && <span className={dashboardStyles.userAccessRole}>
              默认
            </span>
          }
          {
            region.disabled && <span className={dashboardStyles.userAccessRole}>
              已禁用
            </span>
          }
          {
            index < r.length - 1 && <br/>
          }
        </span>
      })
      return {
        ...item,
        regionTexts,
      }
    }
    return {
      ...item
    }
  })

  const locale = {
    emptyText: <NoData title={'环境'} desc={
      '可创建测试、预发、线上等各个环境'}
    />
  }
  const table = <Table
    columns={columns}
    rowKey={"name"}
    dataSource={dataSource}
    locale={locale}
    pagination={{
      position: ['bottomCenter'],
      hideOnSinglePage: true,
      total: dataSource?.length,
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
