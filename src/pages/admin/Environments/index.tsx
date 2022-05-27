import { Button, Divider, Table } from "antd";
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb'
import { useRequest } from "@@/plugin-request/request";
import NoData from "@/components/NoData";
import { queryEnvironments } from "@/services/environments/environments";
import { queryEnvironmentRegions } from "@/services/environmentregions/environmentregions";
import { useState } from "react";
import dashboardStyles from '../../dashboard/index.less';
import { MinusSquareTwoTone, PlusSquareTwoTone } from "@ant-design/icons";
import styles from "@/pages/clusters/Pods/PodsTable/index.less";
import { CheckOutlined } from '@ant-design/icons/lib';

export default () => {
  const [envToRegions, setEnvToRegions] = useState<Map<string, SYSTEM.EnvironmentRegion[]>>(new Map());

  const columns = [
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
      title: '部署区域',
      dataIndex: 'regionTexts',
      key: 'regionTexts',
      render: (text: any) => {
        return text
      }
    },
    {
      title: '操作',
      key: 'operations',
      width: '200px',
      render: (text: string, record: CLUSTER.Environment) => {
        return <div>
          <a type={"primary"} onClick={() => {

          }}>
            添加区域
          </a>
          <Divider type="vertical" />
          <a type={"primary"} onClick={() => {

          }}>
            编辑
          </a>
          <Divider type="vertical" />
          <a type={"primary"} onClick={() => {

          }}>
            删除
          </a>
        </div>
      }
    }
  ]

  const { data: environments = [] } = useRequest(() => queryEnvironments());

  const { data: environmentRegions = [] } = useRequest(() => queryEnvironmentRegions(), {
    onSuccess: () => {
      const m = new Map<string, SYSTEM.EnvironmentRegion[]>();
      for (let i = 0; i < environmentRegions.length; i++) {
        const env = environmentRegions[i].environment
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
    // @ts-ignore
    <div>
      {
        <Button
          type="primary"
          style={{ marginBottom: 10 }}
          onClick={() => {

          }}
        >
          创建环境
        </Button>
      }
    </div>
  )

  const dataSource = environments.map(item => {
    const regions = envToRegions.get(item.name);
    if (regions) {
      const regionTexts = regions.map((region, index) => {
        return <span key={region.region}>
          {region.regionDisplayName}
          {
            region.isDefault && <span className={dashboardStyles.userAccessRole}>
              默认区域
            </span>
          }
          {
            region.disabled && <span className={dashboardStyles.userAccessRole}>
              已停用
            </span>
          }
          {
            index < regions.length - 1 && <br />
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
    expandable={{
      expandedRowRender: (row) => {
        return <Table
          columns={
            [
              {
                title: "区域",
                dataIndex: 'region',
                key: 'region',
              },
              {
                title: "区域名",
                dataIndex: 'regionDisplayName',
                key: 'regionDisplayName',
              },
              {
                title: "默认区域",
                dataIndex: 'isDefault',
                key: 'isDefault',
                render: (text: boolean) => {
                  return text ? <CheckOutlined /> : ""
                }
              },
              {
                title: "已停用",
                dataIndex: 'disabled',
                key: 'disabled',
                render: (text: boolean) => {
                  return text ? <CheckOutlined /> : ""
                }
              },
              {
                title: '操作',
                key: 'id',
                render: (id: number, record: SYSTEM.EnvironmentRegion) => (
                  <div>
                    {
                      (!record.isDefault && !record.disabled) ? <a type={"primary"} onClick={() => {

                      }}>
                        设为默认
                      </a> : <span style={{ color: "grey" }}>
                        设为默认
                      </span>
                    }
                    <Divider type="vertical" />
                    <a onClick={() => {

                    }}>
                      删除
                    </a>
                  </div>
                ),
              },
            ]
          }
          dataSource={envToRegions.get(row.name)}
        />
      },
      onExpand: () => {
      },
      expandIcon: ({ expanded, onExpand, record }) =>
        expanded ? (
          <MinusSquareTwoTone className={styles.expandedIcon} onClick={e => onExpand(record, e)} />
        ) : (
          <PlusSquareTwoTone className={styles.expandedIcon} onClick={e => onExpand(record, e)} />
        )
    }}
  />

  return (
    <PageWithBreadcrumb>
      {queryInput}
      {table}
    </PageWithBreadcrumb>
  )
}
