import {Button, Col, Form, Input, Row, Select} from "antd";
import {useModel} from "@@/plugin-model/useModel";
import {queryHarbors} from "@/services/harbors/harbors";
import {history} from 'umi';
import PageWithBreadcrumb from "@/components/PageWithBreadcrumb";
import {useRequest} from "@@/plugin-request/request";
import {createRegion} from "@/services/kubernetes/kubernetes";
import TextArea from "antd/es/input/TextArea";
const {Option} = Select;

export default () => {
  const [form] = Form.useForm();
  const {successAlert} = useModel('alert')

  const {data: harbors} = useRequest(() => queryHarbors(), {});

  return <PageWithBreadcrumb>
    <Row>
      <Col offset={6} span={12}>
        <Form
          form={form}
          layout={'vertical'}
          onFinish={(v) => {
            createRegion(v).then(({data: id}) => {
              successAlert('Kubernetes 创建成功')
              history.push(`/admin/kubernetes/${id}`)
            })
          }}
        >
          <Form.Item label={"name"} name={'name'} rules={[{required: true}]}>
            <Input/>
          </Form.Item>
          <Form.Item label={"displayName"} name={'displayName'} rules={[{required: true}]}>
            <Input/>
          </Form.Item>
          <Form.Item label={"server"} name={'server'} rules={[{required: true}]}>
            <Input/>
          </Form.Item>
          <Form.Item label={"certificate"} name={'certificate'} rules={[{required: true}]}>
            <TextArea autoSize={{minRows: 5}}/>
          </Form.Item>
          <Form.Item label={"ingress域名"} name={'ingressDomain'} rules={[{required: true}]}>
            <Input/>
          </Form.Item>
          <Form.Item label={"Harbor"} name={'harborID'} rules={[{required: true}]}>
            <Select>
              {
                harbors?.map(item => {
                  return <Option key={item.id} value={item.id}>{item.name}</Option>
                })
              }
            </Select>
          </Form.Item>
          <Form.Item label={"禁用"} name={'disabled'} rules={[{required: true}]}>
            <Select>
              <Option key={'true'} value={true}>是</Option>
              <Option key={'false'} value={false}>否</Option>
            </Select>
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
