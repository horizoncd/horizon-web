import {Button, Col, Form, Input, Row} from "antd";
import {useModel} from "@@/plugin-model/useModel";
import {history} from 'umi';
import PageWithBreadcrumb from "@/components/PageWithBreadcrumb";
import {createEnvironment} from "@/services/environments/environments";

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
            const data: SYSTEM.Environment = {
              ...v,
            }
            createEnvironment(data).then(({data: id}) => {
              successAlert('环境 创建成功')
              history.push(`/admin/environments/${id}`)
            })
          }}
        >
          <Form.Item label={"name"} name={'name'} rules={[{required: true}]}>
            <Input/>
          </Form.Item>
          <Form.Item label={"displayName"} name={'displayName'} rules={[{required: true}]}>
            <Input/>
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
