import {
  useModel, useParams, useRequest, history,
} from 'umi';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import { PageWithInitialState } from '@/components/Enhancement';
import { getWebhook, updateWebhook } from '@/services/webhooks/webhooks';
import { WebhookConfig } from '../components/WebhookComponents';

function EditWebhook(props: { initialState: API.InitialState }) {
  const { successAlert } = useModel('alert');
  const { initialState } = props;
  const {
    fullPath: resourceFullPath,
    type: originResourceType = 'group',
    id: resourceID,
  } = initialState.resource;
  const resourceType = originResourceType!.concat('s');
  const { id: idStr } = useParams<{ id: string }>();
  const id = parseInt(idStr, 10);
  const isAdminPage = originResourceType === 'group' && resourceID === 0;
  const listWebhooksURL = isAdminPage
    ? '/admin/webhooks'
    : `/${resourceType}${resourceFullPath}/-/settings/webhooks`;
  const { data: webhook } = useRequest(() => getWebhook(id));

  const onFinish = (data: Webhooks.CreateOrUpdateWebhookReq) => {
    updateWebhook(id, data).then(() => {
      successAlert('webhook更新成功');
      history.push(listWebhooksURL);
    });
  };

  return (
    <PageWithBreadcrumb>
      <h1>编辑Webhook</h1>
      <div style={{ padding: '20px' }}>
        {webhook && (
          <WebhookConfig
            onFinish={onFinish}
            data={{
              url: webhook?.url,
              description: webhook?.description,
              enabled: webhook?.enabled,
              sslVerifyEnabled: webhook?.sslVerifyEnabled,
              secret: webhook?.secret,
              triggers: webhook?.triggers,
            }}
            onCancel={() => history.push(listWebhooksURL)}
          />
        )}
      </div>
    </PageWithBreadcrumb>
  );
}

export default PageWithInitialState(EditWebhook);
