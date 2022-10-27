import { Form } from 'antd';
import { useParams, useRequest } from 'umi';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import PageWithInitialState from '@/components/PageWithInitialState/PageWithInitialState';
import { getWebhook } from '@/services/webhooks/webhooks';
import { WebhookConfig } from '../components/WebhookConfig';

function WebhookDetail() {
  const [form] = Form.useForm();
  const { id: idStr } = useParams<{ id: string }>();
  const { data: webhook } = useRequest(
    () => getWebhook(
      parseInt(idStr, 10),
    ),
    {
      onSuccess: () => {
        const formData = {
          url: webhook!.url,
          description: webhook!.description,
          enabled: webhook!.enabled,
          sslVerifyEnabled: webhook!.sslVerifyEnabled,
          secret: webhook!.secret,
        };
        webhook!.triggers.forEach((trigger: string) => {
          const parts = trigger.split('_');
          if (parts.length < 2) {
            return;
          }
          formData[parts[0]] = trigger;
        });
        form.setFieldsValue(formData);
      },
    },
  );

  return (
    <PageWithBreadcrumb>
      <div
        style={{
          fontWeight: 'bold',
          marginBottom: '10px',
          fontSize: 'larger',
        }}
      >
        Webhook详情
      </div>
      <div
        style={{ padding: '20px' }}
      >
        <Form
          disabled
          form={form}
          layout="vertical"
        >
          <WebhookConfig />
          {}
        </Form>
      </div>
    </PageWithBreadcrumb>
  );
}

export default PageWithInitialState(WebhookDetail);
