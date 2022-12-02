import { useParams, useRequest } from 'umi';
import { useIntl } from '@@/plugin-locale/localeExports';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import { getWebhookLog } from '@/services/webhooks/webhooks';
import { WebhookLogDetail } from '../components/WebhookComponents';

function LogList() {
  const intl = useIntl();
  const { id: idStr } = useParams<{ id: string }>();
  const id = parseInt(idStr, 10);
  const { data: webhookLog } = useRequest(() => getWebhookLog(id));

  return (
    <PageWithBreadcrumb>
      <div
        style={{
          fontWeight: 'bold',
          marginBottom: '10px',
          fontSize: 'larger',
        }}
      >
        {intl.formatMessage({ id: 'pages.webhook.log.detail.title' })}
      </div>
      <WebhookLogDetail webhookLog={webhookLog} />
    </PageWithBreadcrumb>
  );
}

export default LogList;
