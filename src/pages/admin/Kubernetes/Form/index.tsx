import {
  Button, Form, Input, Select,
} from 'antd';
import { useRequest } from '@@/plugin-request/request';
import TextArea from 'antd/es/input/TextArea';
import { queryHarbors } from '@/services/harbors/harbors';
import common from '@/pages/admin/common';

const { Option } = Select;

export default () => {
  const { data: harbors } = useRequest(() => queryHarbors(), {});

  return (
    <div>
      <Form.Item label="展示名" name="displayName" rules={[{ required: true }]} extra="系统内部展示名称，一般可填为中文名">
        <Input />
      </Form.Item>
      <Form.Item label="访问地址" name="server" rules={common.formRules.url} extra="api-server访问地址，一般建议填为域名">
        <Input />
      </Form.Item>
      <Form.Item label="certificate" name="certificate" rules={[{ required: true }]} extra="访问Kubernetes所需的配置文件，即kubeconfig">
        <TextArea autoSize={{ minRows: 5 }} />
      </Form.Item>
      <Form.Item label="ingress域名" name="ingressDomain" rules={common.formRules.domain} extra="k8s集群中ingress-nginx组件所绑定的域名">
        <Input />
      </Form.Item>
      <Form.Item label="prometheus地址" name="prometheusURL" extra="k8s集群中prometheus的访问地址，建议启用此组件，可获得丰富的指标监控能力">
        <Input />
      </Form.Item>
      <Form.Item label="Harbor" name="harborID" rules={[{ required: true }]} extra="k8s集群中所关联的harbor服务，业务负载的镜像将推送到此harbor">
        <Select>
          {
          harbors?.map((item: SYSTEM.Harbor) => <Option key={item.id} value={item.id}>{item.name}</Option>)
        }
        </Select>
      </Form.Item>
      <Form.Item label="禁用" name="disabled" rules={[{ required: true }]} extra="当k8s需要临时维护或下线时，可选择将其禁用，此后用户创建应用集群时无法再选择到此k8s">
        <Select>
          <Option key="true" value>是</Option>
          <Option key="false" value={false}>否</Option>
        </Select>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </div>
  );
};
