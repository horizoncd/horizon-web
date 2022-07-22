import {Col, Form, Input, Row, Button} from "antd";
import {useModel} from "@@/plugin-model/useModel";
import {history} from 'umi';
import PageWithBreadcrumb from "@/components/PageWithBreadcrumb";
import {TemplateForm, ReleaseForm} from '../form'
import { createTemplate } from "@/services/templates/templates";

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
            createTemplate(1,v).then(({data: id}) => {
              successAlert('Template 创建成功')
              history.push(`/admin/templates/${id}`)
            })
          }}
        >
          <Form.Item label={"名称"} name={'name'} rules={[{required: true}]} extra={'Templates唯一名称标识'}>
            <Input/>
          </Form.Item>
          <TemplateForm/>
          <Form.Item label={"gitlab访问令牌"} name={'token'} rules={[{required: true}]} extra={'具有对应gitlab仓库访问权限的令牌'}>
            <Input/>
          </Form.Item>
          <Form.Item label={"Tag"} name={'repoTag'} rules={[{required: true}]} extra={'release对应的tag名称'}>
            <Input/>
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
