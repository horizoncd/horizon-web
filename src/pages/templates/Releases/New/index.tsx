import {Col, Form, Row, Button} from "antd";
import {useModel} from "@@/plugin-model/useModel";
import {history, useRequest} from 'umi';
import PageWithBreadcrumb from "@/components/PageWithBreadcrumb";
import {ReleaseForm} from '../../components/form'
import {TagSelector} from "../../components/tagSelector";
import {createRelease, queryTemplate} from "@/services/templates/templates";
import {NotFount} from "@/components/State";
import rbac from "@/rbac";

export default () => {
  const [form] = Form.useForm();
  const {successAlert} = useModel('alert')
  
  const {initialState} = useModel("@@initialState")

  if (!initialState?.resource || !initialState.currentUser) {
    return <NotFount />;
  }
  const {id: templateID, fullName} = initialState.resource
  const {data: template} = useRequest(()=>queryTemplate(templateID));
  if (!template) {
    return <NotFount />;
  }

  return <PageWithBreadcrumb>
    <Row>
      <Col offset={6} span={12}>
        <Form
          form={form}
          layout={'vertical'}
          onFinish={(v) => {
            createRelease(templateID, v).then(() => {
              successAlert('Release 创建成功')
              history.push(`/templates/${fullName}/-/detail`)
            })
          }}
        >
          <TagSelector prefix={[]} repository={template.repository}/>
          <ReleaseForm prefix={[]} isAdmin={initialState.currentUser.isAdmin} />
          <Form.Item>
            <Button type="primary" disabled={!rbac.Permissions.createRelease.allowed}
             htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  </PageWithBreadcrumb>
}
