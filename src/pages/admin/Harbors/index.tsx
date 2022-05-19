import {Button, Divider, Modal, Table, Form, Input} from "antd";
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb'
import {useRequest} from "@@/plugin-request/request";
import NoData from "@/components/NoData";
import {createHarbor, deleteHarborByID, queryHarbors, updateHarborByID} from "@/services/harbors/harbors";
import {useState} from "react";
import {useModel} from "@@/plugin-model/useModel";

export default () => {
  const [visible, setVisible] = useState(false)
  const [form] = Form.useForm();
  const {successAlert} = useModel('alert')
  const {data: harbors, run} = useRequest(() => queryHarbors(), {
  });

  const columns = [
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
      title: 'token',
      dataIndex: 'token',
      key: 'token',
    },
    {
      title: 'preheatPolicyID',
      dataIndex: 'preheatPolicyID',
      key: 'preheatPolicyID',
    },
    {
      title: '操作',
      key: "id",
      dataIndex: 'id',
      render: (id: number, r: SYSTEM.Harbor) => {
        return <div>
          <a onClick={() => {
            form.setFieldsValue(r)
            setVisible(true)
          }}>
            编辑
          </a>
          <Divider type="vertical"/>
          <a onClick={() => {
            Modal.confirm({
                title: `确认删除Harbor: ${r.name}`,
                onOk: () => {
                  deleteHarborByID(id).then(() => {
                    setVisible(false)
                    successAlert('Harbor 删除成功')
                    run()
                  })
                }
              }
            )}}
          >
            删除
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
          }}
        >
          创建Harbor
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
    dataSource={harbors}
    locale={locale}
  />

  const id = form.getFieldValue("id")
  const modalTitle = id ? `编辑 Harbor: ${form.getFieldValue("name")}` : '创建 Harbor'

  return (
    <PageWithBreadcrumb>
      {queryInput}
      {table}
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
            const data: SYSTEM.Harbor = {
              ...v,
              preheatPolicyID: parseInt(v.preheatPolicyID)
            }
            if (id) {
              updateHarborByID(id, data).then(() => {
                setVisible(false)
                successAlert('Harbor 更新成功')
                run()
              })
            } else {
              createHarbor(data).then(() => {
                setVisible(false)
                successAlert('Harbor 创建成功')
                run()
              })
            }
          }}
        >
          <Form.Item label={"name"} name={'name'} rules={[{required: true}]}>
            <Input/>
          </Form.Item>
          <Form.Item label={"server"} name={'server'} rules={[{required: true}]}>
            <Input/>
          </Form.Item>
          <Form.Item label={"token"} name={'token'} rules={[{required: true}]}>
            <Input/>
          </Form.Item>
          <Form.Item label={"preheatPolicyID"} name={'preheatPolicyID'} rules={[{required: true}]} >
            <Input type={"number"}/>
          </Form.Item>
        </Form>
      </Modal>
    </PageWithBreadcrumb>
  )
}
