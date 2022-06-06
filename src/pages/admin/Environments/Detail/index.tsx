import DetailCard, {Param} from "@/components/DetailCard";
import {useParams} from "umi";
import NotFount from "@/pages/404";
import {useRequest} from "@@/plugin-request/request";
import Utils from "@/utils";
import {history} from "@@/core/history";
import {Button, Card, Divider, Form, Modal, Select, Space, Table} from "antd";
import {useModel} from "@@/plugin-model/useModel";
import PageWithBreadcrumb from "@/components/PageWithBreadcrumb";
import {deleteEnvironmentByID, getEnvironmentByID} from "@/services/environments/environments";
import {
  createEnvironmentRegion,
  deleteEnvironmentRegionByID,
  queryEnvironmentRegions,
  setDefault
} from "@/services/environmentregions/environmentregions";
import {CheckOutlined} from "@ant-design/icons";
import {useState} from "react";
import {queryRegions} from "@/services/kubernetes/kubernetes";
const {Option} = Select;

export default () => {
  const params = useParams<{ id: string }>();
  if (!params.id || isNaN(parseInt(params.id))) {
    return <NotFount/>;
  }

  const {successAlert} = useModel('alert')
  const [regionForm] = Form.useForm();
  const [regionModalVisible, setRegionModalVisible] = useState(false)
  const environmentID = parseInt(params.id)
  const {data: environment} = useRequest(() => getEnvironmentByID(environmentID), {});
  const {data: environmentRegions, run: runEnvRegions} = useRequest(() => queryEnvironmentRegions(environment!.name), {
    ready: !!environment
  });
  const {data: regions} = useRequest(() => queryRegions(), {});

  const data: Param[][] = [
    [
      {
        key: '环境',
        value: environment?.name,
      },
      {
        key: '环境名',
        value: environment?.displayName,
      },
    ],
    [
      {
        key: '创建时间',
        value: Utils.timeToLocal(environment?.createdAt || ""),
      },
      {
        key: '修改时间',
        value: Utils.timeToLocal(environment?.updatedAt || ""),
      },
    ]
  ]

  return <PageWithBreadcrumb>
    <DetailCard
      title={<span>基础信息</span>}
      data={data}
      extra={
        <Space>
          <Button type='primary' onClick={() => {
            history.push(`/admin/environments/${environmentID}/edit`)
          }}>
            编辑
          </Button>
          <Button danger onClick={() => {
            Modal.confirm({
                title: `确认删除环境: ${environment?.displayName}`,
                onOk: () => {
                  deleteEnvironmentByID(environmentID).then(() => {
                    successAlert('环境 删除成功')
                    history.push(`/admin/environments`)
                  })
                }
              }
            )
          }}
          >
            删除
          </Button>
        </Space>
      }
    />
    <Card title={'关联的Kubernetes'} extra={
      <Button type={"primary"} onClick={() => {
        setRegionModalVisible(true)
      }}>
        添加Kubernetes
      </Button>
    }>
      <Table
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
              title: "默认",
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
                        title: `确认将此Kubernetes设置为默认Kubernetes？`,
                        onOk: () => {
                          setDefault(id).then(() => {
                            successAlert("设置默认Kubernetes成功")
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
        dataSource={environmentRegions}
        pagination={false}
      />
    </Card>
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
            environmentName: environment!.name,
          }).then(() => {
            successAlert('创建成功')
            runEnvRegions()
            setRegionModalVisible(false)
          })
        }}
      >
        <Form.Item label={"Kubernetes"} name={'regionName'} rules={[{required: true}]}>
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
  </PageWithBreadcrumb>
}
