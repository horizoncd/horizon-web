import {
  useModel, useParams, useRequest, history,
} from 'umi';
import { useState } from 'react';
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
  const [formData, setFormData] = useState<Webhooks.CreateOrUpdateWebhookReq>();
  const listWebhooksURL = isAdminPage ? '/admin/webhooks' : `/${resourceType}${resourceFullPath}/-/settings/webhooks`;
  const { data: webhook } = useRequest(
    () => getWebhook(
      id,
    ),
    {
      onSuccess: () => {
        const data = {
          url: webhook!.url,
          description: webhook!.description,
          enabled: webhook!.enabled,
          sslVerifyEnabled: webhook!.sslVerifyEnabled,
          secret: webhook!.secret,
          triggers: webhook!.triggers,
        };
        setFormData(data);
      },
    },
  );

  const onFinish = (data : Webhooks.CreateOrUpdateWebhookReq) => {
    updateWebhook(id, data).then(
      () => {
        successAlert('webhook更新成功');
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
        编辑Webhook
      </div>
      <div
        style={{ padding: '20px' }}
      >
        <WebhookConfig
          onFinish={onFinish}
          data={formData}
          onCancel={() => history.push(listWebhooksURL)}
        />
      </div>
    </PageWithBreadcrumb>
  );
}

export default PageWithInitialState(EditWebhook);
