import {Button, Divider, Form, Input, Modal, Select, Table} from "antd";
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb'
import {useRequest} from "@@/plugin-request/request";
import NoData from "@/components/NoData";
import {
  createRegion,
  deleteRegionByID,
  getRegionTags,
  queryRegions,
  updateRegionByID,
  updateRegionTags
} from "@/services/regions/regions";
import {useState} from "react";
import {useModel} from "@@/plugin-model/useModel";
import {queryHarbors} from "@/services/harbors/harbors";
import TextArea from "antd/es/input/TextArea";
import CollapseList from "@/components/CollapseList";
import DynamicTagForm, {ValueType} from "@/components/DynamicTagForm";

const {Option} = Select;

export default () => {
  const [tagVisible, setTagVisible] = useState(false)
  const [curRow, setCurRow] = useState<SYSTEM.Region>()
  const [visible, setVisible] = useState(false)
  const [operation, setOperation] = useState('')
  const [form] = Form.useForm();
  const {successAlert} = useModel('alert')
  const {data: regions, run} = useRequest(() => queryRegions(), {});
  const {data: harbors} = useRequest(() => queryHarbors(), {});
  const mapOperator = new Map([
    ["view", "查看"], ["edit", "编辑"], ["create", "创建"],
  ])

  const columns = [
    {
      title: '区域',
      dataIndex: 'name',
    },
    {
      title: '区域名',
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
      title: 'harbor',
      dataIndex: ['harbor', 'name'],
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
      title: '操作',
      dataIndex: 'id',
      width: '150px',
      render: (id: number, r: SYSTEM.Region) => {
        return <div>
          <a onClick={() => {
            form.setFieldsValue(r)
            setVisible(true)
            setOperation("view")
          }}>
            查看
          </a>
          <Divider type="vertical"/>
          <a onClick={() => {
            form.setFieldsValue(r)
            setVisible(true)
            setOperation("edit")
          }}>
            编辑
          </a>
          <Divider type="vertical"/>
          <a onClick={() => {
            Modal.confirm({
              title: `确认删除 Region: ${r.displayName}`,
              content: `此为危险操作！如果某个环境已将此区域设置为默认部署区域，将导致该环境失去默认部署区域，需要选择其他区域作为默认部署区域`,
              onOk: () => {
                deleteRegionByID(id).then(() => {
                  setVisible(false)
                  successAlert('Region 删除成功')
                  run()
                })
              }
            })
          }}>
            删除
          </a>
          <br/>
          <a onClick={() => {
            setTagVisible(true)
            setCurRow(r)
          }
          }>
            标签管理
          </a>
        </div>
      }
    }
  ]

  const queryInput = (
    // @ts-ignore
    <div>
      {
        <Button
          type="primary"
          style={{marginBottom: 10}}
          onClick={() => {
            form.resetFields()
            setVisible(true)
            setOperation("create")
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
    rowKey={'id'}
    columns={columns}
    dataSource={regions}
    locale={locale}
  />

  const id = form.getFieldValue("id")

  const modalTitle = `${mapOperator.get(operation)} Region`
  return (
    <PageWithBreadcrumb>
      {queryInput}
      {table}
      <Modal
        visible={tagVisible}
        footer={null}
        onCancel={() => setTagVisible(false)}
      >
        {
          curRow && <div>
            <h1>{"标签管理"}</h1>
            <Divider/>
            <DynamicTagForm
              queryTags={() => getRegionTags(curRow.id)}
              updateTags={(data) => updateRegionTags(curRow.id, data)}
              valueType={ValueType.Single}
              callback={() => {
                setTagVisible(false)
                run()
              }}
            />
          </div>
        }
      </Modal>
      <Modal
        width={700}
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
                updateRegionByID(id, v).then(() => {
                  setVisible(false)
                  successAlert('Region 更新成功')
                  run()
                })
                break
              case 'create':
                createRegion(v).then(() => {
                  setVisible(false)
                  successAlert('Region 创建成功')
                  run()
                })
                break
              default:
                setVisible(false)
            }
          }}
        >
          <Form.Item label={"name"} name={'name'} rules={[{required: true}]}>
            <Input disabled={operation === 'view' || operation === 'edit'}/>
          </Form.Item>
          <Form.Item label={"displayName"} name={'displayName'} rules={[{required: true}]}>
            <Input disabled={operation === 'view'}/>
          </Form.Item>
          <Form.Item label={"server"} name={'server'} rules={[{required: true}]}>
            <Input disabled={operation === 'view'}/>
          </Form.Item>
          <Form.Item label={"certificate"} name={'certificate'} rules={[{required: true}]}>
            <TextArea autoSize={{minRows: 5}} disabled={operation === 'view'}/>
          </Form.Item>
          <Form.Item label={"ingress域名"} name={'ingressDomain'} rules={[{required: true}]}>
            <Input disabled={operation === 'view'}/>
          </Form.Item>
          <Form.Item label={"Harbor"} name={'harborID'} rules={[{required: true}]}>
            <Select disabled={operation === 'view'}>
              {
                harbors?.map(item => {
                  return <Option key={item.id} value={item.id}>{item.name}</Option>
                })
              }
            </Select>
          </Form.Item>
          <Form.Item label={"禁用"} name={'disabled'} rules={[{required: true}]}>
            <Select disabled={operation === 'view'}>
              <Option key={'true'} value={true}>是</Option>
              <Option key={'false'} value={false}>否</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </PageWithBreadcrumb>
  )
}
