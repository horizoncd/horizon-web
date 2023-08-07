import { Form } from 'antd';
import { useParams, useRequest } from 'umi';
import { useIntl } from '@@/plugin-locale/localeExports';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import { PageWithInitialState } from '@/components/Enhancement';
import { getWebhook } from '@/services/webhooks/webhooks';
import { WebhookLogs } from '../components/WebhookComponents';

function LogList(props: { initialState: API.InitialState }) {
  const intl = useIntl();
  const { initialState } = props;
  const {
    id: resourceID = 0,
    fullPath: resourceFullPath,
    type: resourceType,
  } = initialState.resource;
  const { id: idStr } = useParams<{ id: string }>();
  const id = parseInt(idStr, 10);
  const [form] = Form.useForm();
  const isAdminPage = resourceType === 'group' && resourceID === 0;
  const webhookLogDetailURL = isAdminPage
    ? `/admin/webhooks/${id}/`
    : `/${resourceType === 'clusters' ? 'instances' : resourceType}s${resourceFullPath}/-/settings/webhooks/${id}/`;

  const { data: webhook } = useRequest(() => getWebhook(id), {
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
  });

  return (
    <PageWithBreadcrumb>
      <div
        style={{
          fontWeight: 'bold',
          marginBottom: '10px',
          fontSize: 'larger',
        }}
      >
        {intl.formatMessage({ id: 'pages.webhook.log.list.title' })}
      </div>
      <div style={{ padding: '20px' }}>
        <WebhookLogs detailURL={webhookLogDetailURL} webhookID={id} />
      </div>
    </PageWithBreadcrumb>
  );
}

export default PageWithInitialState(LogList);
