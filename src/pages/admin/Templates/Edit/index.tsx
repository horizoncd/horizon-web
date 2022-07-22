import {Button, Col, Form, Input, Row} from "antd";
import {useModel} from "@@/plugin-model/useModel";
import {history} from 'umi';
import PageWithBreadcrumb from "@/components/PageWithBreadcrumb";
import {useParams} from 'umi';
import {useRequest} from "@@/plugin-request/request";
import NotFount from "@/pages/404";
import {queryTemplate, updateTemplate} from "@/services/templates/templates";
import {TemplateForm} from "../form";

export default () => {
  const [form] = Form.useForm();
  const {successAlert} = useModel('alert')
  const params = useParams<{id: string,template: string}>();
  if (!params.id || isNaN(parseInt(params.id))) {
    return <NotFount/>;
  }

  const templateID = parseInt(params.id)
  const {data: template} = useRequest(() => queryTemplate(templateID), {
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
            updateTemplate(templateID, v).then(() => {
              successAlert('更新成功')
              history.push(`/admin/templates/${templateID}`)
            })
          }}
        >
          <Form.Item label={"名称"} name={'name'} rules={[{required: true}]} extra={'Templates唯一名称标识'}>
            <Input disabled/>
          </Form.Item>
          <TemplateForm/>
          <Form.Item label={"gitlab访问令牌"} name={'token'} extra={'具有对应gitlab仓库访问权限的令牌'}>
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
