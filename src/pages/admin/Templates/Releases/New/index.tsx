import {Col, Form, Input, Row, Button} from "antd";
import {useModel} from "@@/plugin-model/useModel";
import {history, useParams} from 'umi';
import PageWithBreadcrumb from "@/components/PageWithBreadcrumb";
import {createRegion} from "@/services/regions/regions";
import {ReleaseForm} from '../../form'

export default () => {
  const [form] = Form.useForm();
  const {successAlert} = useModel('alert')

  const params = useParams<{id: string}>()
  const templateID = params.id

  return <PageWithBreadcrumb>
    <Row>
      <Col offset={6} span={12}>
        <Form
          form={form}
          layout={'vertical'}
          onFinish={(v) => {
            createRegion(v).then(({data: id}) => {
              successAlert('Release 创建成功')
              history.push(`/admin/templates/${templateID}/releases/${id}`)
            })
          }}
        >
          <Form.Item label={"Tag"} name={'repoTag'} extra={'release对应的tag名称'}>
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
