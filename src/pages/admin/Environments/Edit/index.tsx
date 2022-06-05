import {Button, Col, Form, Input, Row} from "antd";
import {useModel} from "@@/plugin-model/useModel";
import {history} from 'umi';
import PageWithBreadcrumb from "@/components/PageWithBreadcrumb";
import { useParams } from 'umi';
import {useRequest} from "@@/plugin-request/request";
import NotFount from "@/pages/404";
import {getEnvironmentByID, updateEnvironmentByID} from "@/services/environments/environments";

export default () => {
  const [form] = Form.useForm();
  const {successAlert} = useModel('alert')
  const params = useParams<{id: string}>();
  if (!params.id || isNaN(parseInt(params.id))) {
    return <NotFount/>;
  }

  const environmentID = parseInt(params.id)
  const {data: environment} = useRequest(() => getEnvironmentByID(environmentID), {
    onSuccess: () => {
      form.setFieldsValue(environment)
    }
  });

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
            updateEnvironmentByID(environmentID, data).then(() => {
              successAlert('环境 编辑成功')
              history.push(`/admin/environments/${environmentID}`)
            })
          }}
        >
          <Form.Item label={"name"} name={'name'} rules={[{required: true}]}>
            <Input disabled/>
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
