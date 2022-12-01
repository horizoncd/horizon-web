import { useModel, history } from 'umi';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import { PageWithInitialState } from '@/components/Enhancement';
import { WebhookConfig } from '../components/WebhookComponents';
import { createWebhook } from '@/services/webhooks/webhooks';

function New(props: { initialState: API.InitialState }) {
  const { initialState } = props;
  const {
    id: resourceID = 0,
    fullPath: resourceFullPath,
    type: originResourceType = 'group',
  } = initialState.resource;
  const { successAlert } = useModel('alert');
  const resourceType = originResourceType!.concat('s');
  const isAdminPage = originResourceType === 'group' && resourceID === 0;
  const listWebhooksURL = isAdminPage ? '/admin/webhooks' : `/${resourceType}${resourceFullPath}/-/settings/webhooks`;

  const onFinish = (data: Webhooks.CreateOrUpdateWebhookReq) => {
    createWebhook(resourceType!, resourceID!, data).then(
      () => {
        successAlert('webhook创建成功');
        history.push(listWebhooksURL);
      },
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
        <WebhookConfig
          onFinish={onFinish}
          onCancel={() => history.push(listWebhooksURL)}
        />
      </div>
    </PageWithBreadcrumb>
  );
}

export default PageWithInitialState(New);
