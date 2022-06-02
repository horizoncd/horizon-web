import {Button, Divider, Form, Input, Modal, Select, Space, Table} from "antd";
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb'
import {useRequest} from "@@/plugin-request/request";
import NoData from "@/components/NoData";
import {createEnvironment, queryEnvironments, updateEnvironmentByID} from "@/services/environments/environments";
import {
  createEnvironmentRegion,
  deleteEnvironmentRegionByID,
  queryEnvironmentRegions,
  setDefault
} from "@/services/environmentregions/environmentregions";
import {useState} from "react";
import dashboardStyles from '../../dashboard/index.less';
import {MinusSquareTwoTone, PlusSquareTwoTone} from "@ant-design/icons";
import styles from "@/pages/clusters/Pods/PodsTable/index.less";
import {CheckOutlined} from '@ant-design/icons/lib';
import {useModel} from "@@/plugin-model/useModel";
import {queryRegions} from "@/services/regions/regions";
import {history} from "@@/core/history";

const {Option} = Select;

export default () => {
  const [envToRegions, setEnvToRegions] = useState<Map<string, SYSTEM.EnvironmentRegion[]>>(new Map());
  const [visible, setVisible] = useState(false)
  const [regionModalVisible, setRegionModalVisible] = useState(false)
  const [operation, setOperation] = useState('')
  const [curRow, setCurRow] = useState<SYSTEM.Environment>()
  const mapOperator = new Map([
    ["edit", "编辑"], ["create", "创建"],
  ])
  const [form] = Form.useForm();
  const [regionForm] = Form.useForm();
  const {successAlert} = useModel('alert')

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
      render: (text: string, r: SYSTEM.Environment) => {
        return <div>
          <a type={"primary"} onClick={() => {
            setRegionModalVisible(true)
            setCurRow(r)
          }}>
            添加区域
          </a>
          <Divider type="vertical"/>
          <a type={"primary"} onClick={() => {
            setVisible(true)
            setOperation("edit")
            form.setFieldsValue(r)
          }}>
            编辑
          </a>
        </div>
      }
    }
  ]

  const {data: environments = [], run: runEnv} = useRequest(() => queryEnvironments());
  const {data: regions} = useRequest(() => queryRegions(), {});

  const {data: environmentRegions = [], run: runEnvRegions} = useRequest(() => queryEnvironmentRegions(), {
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
        setVisible(true)
        setOperation("create")
        form.resetFields()
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
              默认区域
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
    expandable={{
      expandedRowRender: (row) => {
        return <Table
          columns={
            [
              {
                title: "区域",
                dataIndex: 'regionName',
              },
              {
                title: "区域名",
                dataIndex: 'regionDisplayName',
              },
              {
                title: "默认区域",
                dataIndex: 'isDefault',
                render: (text: boolean) => {
                  return text ? <CheckOutlined/> : ""
                }
              },
              {
                title: '启用状态',
                dataIndex: 'disabled',
                render: (disabled: boolean) => {
                  return disabled ? <span style={{color: 'red'}}>已禁用</span> : "启用中"
                }
              },
              {
                title: '操作',
                dataIndex: 'id',
                render: (id: number, record: SYSTEM.EnvironmentRegion) => (
                  <div>
                    {
                      (!record.isDefault && !record.disabled) ? <a type={"primary"} onClick={() => {
                        Modal.confirm({
                          title: `确认将此区域设置为默认区域？`,
                          onOk: () => {
                            setDefault(id).then(() => {
                              successAlert("设置默认区域成功")
                              runEnvRegions()
                            })
                          }
                        })
                      }}>
                        设为默认
                      </a> : <span style={{color: "grey"}}>
                        设为默认
                      </span>
                    }
                    <Divider type="vertical"/>
                    <a onClick={() => {
                      Modal.confirm({
                        title: `确认删除此关联区域？`,
                        onOk: () => {
                          deleteEnvironmentRegionByID(id).then(() => {
                            successAlert("删除成功")
                            runEnvRegions()
                          })
                        }
                      })
                    }}>
                      删除
                    </a>
                  </div>
                ),
              },
            ]
          }
          dataSource={envToRegions.get(row.name)}
          pagination={false}
        />
      },
      onExpand: () => {
      },
      expandIcon: ({expanded, onExpand, record}) =>
        expanded ? (
          <MinusSquareTwoTone className={styles.expandedIcon} onClick={e => onExpand(record, e)}/>
        ) : (
          <PlusSquareTwoTone className={styles.expandedIcon} onClick={e => onExpand(record, e)}/>
        )
    }}
  />

  const modalTitle = `${mapOperator.get(operation)} 环境`
  const id = form.getFieldValue("id")

  return (
    <PageWithBreadcrumb>
      <Modal
        visible={regionModalVisible}
        onCancel={() => setRegionModalVisible(false)}
        onOk={() => {
          regionForm.submit()
        }}
      >
        <Form
          form={regionForm}
          layout={'vertical'}
          onFinish={(v) => {
            // create environmentRegion
            createEnvironmentRegion({
              ...v,
              environmentName: curRow!.name,
            }).then(() => {
              successAlert('创建成功')
              runEnvRegions()
              setRegionModalVisible(false)
            })
          }}
        >
          <Form.Item label={"区域"} name={'regionName'} rules={[{required: true}]}>
            <Select>
              {
                regions?.map(item => {
                  return <Option value={item.name}>{item.displayName}</Option>
                })
              }
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={modalTitle}
        visible={visible}
        onCancel={() => setVisible(false)}
        onOk={() => {
          form.submit()
        }}
      >
        <Form
          form={form}
          layout={'vertical'}
          onFinish={(v) => {
            switch (operation) {
              case 'edit':
                updateEnvironmentByID(id, v).then(() => {
                  setVisible(false)
                  successAlert('更新成功')
                  runEnv()
                })
                break
              case 'create':
                createEnvironment(v).then(() => {
                  setVisible(false)
                  successAlert('创建成功')
                  runEnv()
                })
                break
            }
          }}
        >
          <Form.Item label={"name"} name={'name'} rules={[{required: true}]}>
            <Input disabled={operation === 'edit'}/>
          </Form.Item>
          <Form.Item label={"displayName"} name={'displayName'} rules={[{required: true}]}>
            <Input/>
          </Form.Item>
        </Form>
      </Modal>
      {queryInput}
      {table}
    </PageWithBreadcrumb>
  )
}
