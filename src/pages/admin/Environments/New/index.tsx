import {Button, Col, Form, Input, Row} from "antd";
import {useModel} from "@@/plugin-model/useModel";
import {createHarbor} from "@/services/harbors/harbors";
import {history} from 'umi';
import PageWithBreadcrumb from "@/components/PageWithBreadcrumb";

export default () => {
  const [form] = Form.useForm();
  const {successAlert} = useModel('alert')

  return <PageWithBreadcrumb>
    <Row>
      <Col offset={6} span={12}>
        <Form
          form={form}
          layout={'vertical'}
          onFinish={(v) => {
            const data: SYSTEM.Harbor = {
              ...v,
              preheatPolicyID: parseInt(v.preheatPolicyID)
            }
            createHarbor(data).then(({data: id}) => {
              successAlert('Harbor 创建成功')
              history.push(`/admin/harbors${id}`)
            })
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
          <Form.Item label={"preheatPolicyID"} name={'preheatPolicyID'} rules={[{required: true}]}>
            <Input type={"number"}/>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  </PageWithBreadcrumb>
}
