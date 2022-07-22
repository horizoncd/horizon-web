import {Button, Col, Form, Input, Row} from "antd";
import {useModel} from "@@/plugin-model/useModel";
import {history} from 'umi';
import PageWithBreadcrumb from "@/components/PageWithBreadcrumb";
import {useParams} from 'umi';
import {useRequest} from "@@/plugin-request/request";
import NotFount from "@/pages/404";
import {getRelease, updateRelease} from "@/services/templates/templates";
import {ReleaseForm} from "../../form";

export default () => {
  const [form] = Form.useForm();
  const {successAlert} = useModel('alert')
  const params = useParams<{id: string, template: string}>();
  if (!params.id || isNaN(parseInt(params.id))) {
    return <NotFount/>;
  }

  const templateID = params.template
  const releaseID = parseInt(params.id)
  const {data: template} = useRequest(() => getRelease(releaseID), {
    onSuccess: () => {
      form.setFieldsValue(template)
    }
  });

  return <PageWithBreadcrumb>
    <Row>
      <Col offset={6} span={12}>
        <Form
          form={form}
          layout={'vertical'}
          onFinish={(v) => {
            updateRelease(releaseID, v).then(() => {
              successAlert('Release 更新成功')
              history.push(`/admin/templates/${templateID}/releases/${releaseID}`)
            })
          }}
        >
          <Form.Item label={"名称"} name={'name'} rules={[{required: true}]} extra={'release对应的tag名称'}>
            <Input disabled/>
          </Form.Item>
          <ReleaseForm/>
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
