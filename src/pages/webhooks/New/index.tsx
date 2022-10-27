import { useModel } from 'umi';
import { Form } from 'antd';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import PageWithInitialState from '@/components/PageWithInitialState/PageWithInitialState';
import { ResourceTriggers, WebhookConfig, WebhookButtons } from '../components/WebhookConfig';
import { createWebhook } from '@/services/webhooks/webhooks';

function NewWebhook(props: { initialState: API.InitialState }) {
  const { initialState } = props;
  const {
    id: resourceID = 0,
    // fullPath: resourceFullPath,
    type: originResourceType = 'group',
  } = initialState.resource;
  const { successAlert } = useModel('alert');
  const resourceType = originResourceType!.concat('s');

  const onFinish = (formData: Webhooks.CreateWebhookReq) => {
    const data: Webhooks.CreateWebhookReq = {
      url: formData.url,
      enabled: formData.enabled,
      secret: formData.secret,
      description: formData.description,
      sslVerifyEnabled: formData.sslVerifyEnabled,
      triggers: [],
    };
    Object.keys(ResourceTriggers).forEach((k) => {
      data.triggers = data.triggers.concat(formData[k]);
    });
    createWebhook(resourceType!, resourceID!, data).then(
      () => successAlert('webhook创建成功'),
    );
  };

  return (
    <PageWithBreadcrumb>
      <div
        style={{
          fontWeight: 'bold',
          marginBottom: '10px',
          fontSize: 'larger',
        }}
      >
        新建Webhook
      </div>
      <div
        style={{ padding: '20px' }}
      >
        <Form
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            enabled: true,
            sslVerifyEnabled: true,
          }}
        >
          <WebhookConfig />
          <WebhookButtons />
        </Form>
      </div>
    </PageWithBreadcrumb>
  );
}

export default PageWithInitialState(NewWebhook);
