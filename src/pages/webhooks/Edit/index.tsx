import { Form } from 'antd';
import { useModel, useParams, useRequest } from 'umi';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import PageWithInitialState from '@/components/PageWithInitialState/PageWithInitialState';
import { getWebhook, updateWebhook } from '@/services/webhooks/webhooks';
import { ResourceTriggers, WebhookButtons, WebhookConfig } from '../components/WebhookConfig';

// function EditWebhook(props: { initialState: API.InitialState }) {
function EditWebhook() {
  const [form] = Form.useForm();
  const { successAlert } = useModel('alert');
  const { id: idStr } = useParams<{ id: string }>();
  const id = parseInt(idStr, 10);
  const { data: webhook } = useRequest(
    () => getWebhook(
      id,
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
          if (!formData[parts[0]]) {
            formData[parts[0]] = [];
          }
          formData[parts[0]] = formData[parts[0]].concat(trigger);
        });
        form.setFieldsValue(formData);
      },
    },
  );

  const onFinish = (formData: Webhooks.UpdateWebhookReq) => {
    const data: Webhooks.UpdateWebhookReq = {
      url: formData.url,
      enabled: formData.enabled,
      secret: formData.secret,
      description: formData.description,
      sslVerifyEnabled: formData.sslVerifyEnabled,
      triggers: [],
    };
    Object.keys(ResourceTriggers).forEach((k) => {
      data.triggers = data.triggers!.concat(formData[k]);
    });
    updateWebhook(id, data).then(
      () => successAlert('webhook更新成功'),
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
        编辑Webhook
      </div>
      <div
        style={{ padding: '20px' }}
      >
        <Form
          onFinish={onFinish}
          form={form}
          layout="vertical"
        >
          <WebhookConfig />
          <WebhookButtons />
          {}
        </Form>
      </div>
    </PageWithBreadcrumb>
  );
}

export default PageWithInitialState(EditWebhook);
