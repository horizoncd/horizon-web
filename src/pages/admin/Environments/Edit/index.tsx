import {Button, Col, Form, Input, Row} from "antd";
import {useModel} from "@@/plugin-model/useModel";
import {getHarborByID, updateHarborByID} from "@/services/harbors/harbors";
import {history} from 'umi';
import PageWithBreadcrumb from "@/components/PageWithBreadcrumb";
import { useParams } from 'umi';
import {useRequest} from "@@/plugin-request/request";
import NotFount from "@/pages/404";

export default () => {
  const [form] = Form.useForm();
  const {successAlert} = useModel('alert')
  const params = useParams<{id: string}>();
  if (!params.id || isNaN(parseInt(params.id))) {
    return <NotFount/>;
  }

  const harborID = parseInt(params.id)
  const {data: harbor} = useRequest(() => getHarborByID(harborID), {
    onSuccess: () => {
      form.setFieldsValue(harbor)
    }
  });

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
            updateHarborByID(harborID, data).then(() => {
              successAlert('Harbor 编辑成功')
              history.push(`/admin/harbors/${harborID}`)
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
