import { useParams, useModel, useRequest } from 'umi';
import { useIntl } from '@@/plugin-locale/localeExports';
import { Button } from 'antd';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import { resendWebhookLogs, getWebhookLog } from '@/services/webhooks/webhooks';
import { WebhookLogDetail } from '../components/WebhookComponents';

const WebhookLogResendButton = (props: { id: number }) => {
  const { id } = props;
  const intl = useIntl();
  const { successAlert } = useModel('alert');
  return (
    <Button
      style={
      {
        float: 'right',
      }
    }
      onClick={() => {
        resendWebhookLogs(id).then(() => {
          successAlert(
            intl.formatMessage({
              id: 'pages.webhook.component.table.operations.retry.prompt',
            }),
          );
        });
      }}
    >
      {intl.formatMessage({ id: 'pages.webhook.component.table.operations.retry' })}
    </Button>
  );
};

function LogDetail() {
  const intl = useIntl();
  const { id: idStr } = useParams<{ id: string }>();
  const id = parseInt(idStr, 10);
  const { data: webhookLog } = useRequest(() => getWebhookLog(id));

  return (
    <PageWithBreadcrumb>
      <div
        style={{
          fontWeight: 'bold',
          marginBottom: '20px',
          fontSize: 'larger',
        }}
      >
        {intl.formatMessage({ id: 'pages.webhook.log.detail.title' })}
        <WebhookLogResendButton id={id} />
      </div>
      <WebhookLogDetail webhookLog={webhookLog} />
    </PageWithBreadcrumb>
  );
}

export default LogDetail;
