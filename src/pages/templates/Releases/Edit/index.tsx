import {Button, Col, Form, Input, Row} from "antd";
import {useModel} from "@@/plugin-model/useModel";
import {history} from 'umi';
import PageWithBreadcrumb from "@/components/PageWithBreadcrumb";
import {useRequest} from "@@/plugin-request/request";
import NotFount from "@/pages/404";
import {getRelease, updateRelease} from "@/services/templates/templates";
import {ReleaseForm} from "../../components/form";
import rbac from "@/rbac";

export default () => {
  const [form] = Form.useForm();
  const {successAlert} = useModel('alert')

  const {initialState} = useModel("@@initialState")

  if (!initialState?.resource.id || !initialState.currentUser) {
    return <NotFount />;
  }

  const releaseID = initialState.resource.id
  const {fullName} = initialState.resource
  const {data: release} = useRequest(() => getRelease(releaseID), {
    onSuccess: () => {
      form.setFieldsValue(release)
    }
  });

  const [_,templatePath, releasePath] = /(.*)\/(.*?)$/.exec(fullName)!

  return <PageWithBreadcrumb>
    <Row>
      <Col offset={6} span={12}>
        <Form
          form={form}
          layout={'vertical'}
          onFinish={(v) => {
            updateRelease(releaseID, v).then(() => {
              successAlert('Release 更新成功')
              history.push(`/templates/${templatePath}/-/${releasePath}/detail`)
            })
          }}
        >
          <Form.Item label={"名称"} name={'name'} rules={[{required: true}]} extra={'release对应的tag名称'}>
            <Input disabled/>
          </Form.Item>
          <ReleaseForm prefix={[]} isAdmin={initialState.currentUser.isAdmin}/>
            <Form.Item>
            <Button type="primary" disabled={!rbac.Permissions.updateRelease.allowed}
            htmlType="submit">
                Submit
            </Button>
            </Form.Item>
        </Form>
      </Col>
    </Row>
  </PageWithBreadcrumb>
}
