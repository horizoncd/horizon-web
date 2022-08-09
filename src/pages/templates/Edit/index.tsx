import {Button, Col, Form, Input, Row} from "antd";
import {useModel} from "@@/plugin-model/useModel";
import {history} from 'umi';
import PageWithBreadcrumb from "@/components/PageWithBreadcrumb";
import {useRequest} from "@@/plugin-request/request";
import NotFount from "@/pages/404";
import {queryTemplate, updateTemplate} from "@/services/templates/templates";
import {TemplateForm} from "../components/form";
import rbac from "@/rbac";

export default () => {
  const [form] = Form.useForm();
  const {successAlert} = useModel('alert')

  const {initialState} = useModel("@@initialState")

  if (!initialState?.resource.id || !initialState.currentUser) {
    return <NotFount />;
  }

  const templateID = initialState.resource.id
  const fullName = initialState.resource.fullName
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
              history.push(`/templates/${fullName}/-/detail`)
            })
          }}
        >
          <Form.Item label={"名称"} name={'name'} rules={[{required: true}]} extra={'Templates唯一名称标识'}>
            <Input disabled/>
          </Form.Item>
          <TemplateForm onRepositoryBlur={()=>{}} isAdmin={initialState.currentUser.isAdmin}/>
          <Form.Item>
            <Button type="primary" disabled={!rbac.Permissions.updateTemplate.allowed} 
            htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  </PageWithBreadcrumb>
}
