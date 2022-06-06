import {Col, Form, Input, Row} from "antd";
import {useModel} from "@@/plugin-model/useModel";
import {history} from 'umi';
import PageWithBreadcrumb from "@/components/PageWithBreadcrumb";
import { useParams } from 'umi';
import {useRequest} from "@@/plugin-request/request";
import NotFount from "@/pages/404";
import {getRegionByID, updateRegionByID} from "@/services/kubernetes/kubernetes";
import KubernetesForm from "@/pages/admin/Kubernetes/Form";

export default () => {
  const [form] = Form.useForm();
  const {successAlert} = useModel('alert')
  const params = useParams<{id: string}>();
  if (!params.id || isNaN(parseInt(params.id))) {
    return <NotFount/>;
  }

  const regionID = parseInt(params.id)
  const {data: region} = useRequest(() => getRegionByID(regionID), {
    onSuccess: () => {
      form.setFieldsValue(region)
    }
  });

  return <PageWithBreadcrumb>
    <Row>
      <Col offset={6} span={12}>
        <Form
          form={form}
          layout={'vertical'}
          onFinish={(v) => {
            updateRegionByID(regionID, v).then(() => {
              successAlert('Kubernetes 更新成功')
              history.push(`/admin/kubernetes/${regionID}`)
            })
          }}
        >
          <Form.Item label={"名称"} name={'name'} rules={[{required: true}]} extra={'Kubernetes唯一名称标识'}>
            <Input disabled/>
          </Form.Item>
          <KubernetesForm/>
        </Form>
      </Col>
    </Row>
  </PageWithBreadcrumb>
}
