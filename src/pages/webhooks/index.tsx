import { useState } from 'react';
import { useModel, useRequest } from 'umi';
import { history } from 'umi';
import {
  Button, Modal, Space, Table, Tag,
} from 'antd';
import styled from 'styled-components';
import PageWithInitialState from '@/components/PageWithInitialState/PageWithInitialState';
import { deleteWebhook, listWebhooks, updateWebhook } from '@/services/webhooks/webhooks';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import utils from '@/utils';

type WebhookData = {
  key: number,
  id: number,
  enabled: boolean,
  url: string,
  triggers: string[],
  description: string,
  createdAt: string,
};

const StyledTag = styled(Tag)`
  background-color: #f2f2f2;
  border-radius: 1rem;
  display: inline-block;
  white-space: pre-line;
  word-break: break-all;
  border-width: 0;
  font-size: 14px;
  margin-bottom: 5px;
`;

function WebhookList(props: { initialState: API.InitialState }) {
  const { initialState } = props;
  const {
    id: resourceID = 0,
    fullPath: resourceFullPath,
    type: resourceType = 'group',
  } = initialState.resource;
  const [pageNumber, setPageNumber] = useState(1);
  const [total, setTotal] = useState(0);
  const [webhookTableData, setWebhookTableData] = useState<WebhookData[]>();
  const pageSize = 10;
  const { successAlert } = useModel('alert');
  const isAdminPage = resourceType === 'group' && resourceID === 0;

  const createWebhookURL = isAdminPage ? '/admin/webhooks/new' : `/${resourceType}/${resourceFullPath}/-/newwebhook`;
  const getEditWebhookURL = (id: number) => {
    const editWebhookURL = isAdminPage ? `/admin/webhooks/${id}/edit` : `/webhooks/${resourceFullPath}/${id}/-/edit`;
    return editWebhookURL;
  };
  const getViewWebhookURL = (id: number) => {
    const viewWebhookURL = isAdminPage ? `/admin/webhooks/${id}` : `/webhooks/${resourceFullPath}/${id}/-/detail`;
    return viewWebhookURL;
  };

  const { data: webhooks, run: refreshWebhookList } = useRequest(() => listWebhooks(
    resourceType,
    resourceID,
    { pageNumber, pageSize },
  ), {
    onSuccess: () => {
      const wh: WebhookData[] = webhooks!.items.map(
        (w: Webhooks.Webhook) => (
          {
            key: w.id,
            id: w.id,
            enabled: w.enabled,
            url: w.url,
            triggers: w.triggers,
            description: w.description,
            createdAt: utils.timeToLocal(w.createdAt),
          } as WebhookData),
      );
      setWebhookTableData(wh);
      setTotal(webhooks!.total);
    },
  });

  const { run: toggleWebhookEnabled } = useRequest((id: number, enabled: boolean) => updateWebhook(
    id,
    { enabled },
  ), {
    onSuccess: () => {
      successAlert('更新webhook成功');
      refreshWebhookList();
    },
    manual: true,
  });

  const columns = [
    {
      title: 'id',
      dataIndex: 'id',
      key: 'id',
      render: (id: number) => (
        <Button
          type="link"
          onClick={() => history.push(getViewWebhookURL(id))}
        >
          #
          {id}
        </Button>
      ),
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
    },
    {
      title: '触发事件',
      dataIndex: 'triggers',
      key: 'triggers',
      render: (triggers: string[]) => (
        triggers.map((trigger) => (
          <StyledTag>
            {trigger}
          </StyledTag>
        ))
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      key: 'operation',
      render: (record: WebhookData) => (
        <Space
          size="small"
          style={{ maxWidth: '200px', whiteSpace: 'nowrap' }}
        >
          <Button
            type="link"
            onClick={() => toggleWebhookEnabled(record.id, !record.enabled)}
          >
            {record.enabled ? '禁用' : '启用'}
          </Button>
          <Button
            type="link"
            onClick={() => history.push(getEditWebhookURL(record.id))}
          >
            编辑
          </Button>
          <Button
            type="link"
            onClick={() => deleteWebhook(record.id).then(() => {
              Modal.confirm({
                title: `确认删除Webhook: ${record.url}`,
                content: '请确认该webhook已经没有使用',
                onOk: () => {
                  deleteWebhook(record.id).then(() => successAlert('删除webhook成功'));
                },
              });
            })}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <PageWithBreadcrumb>
      <div
        style={{
          fontWeight: 'bold',
          marginBottom: '10px',
          fontSize: 'larger',
        }}
      >
        Webhook
      </div>
      <span>
        您可以使用webhook将特定事件发送给外部系统，配置使用的secret，会放在请求头： X-Horizon-Webhook-Secret 中
      </span>
      <div
        style={{ marginTop: '30px' }}
      >
        <span
          style={{
            fontWeight: 'bold',
            marginBottom: '10px',
            fontSize: 'larger',
          }}
        >
          已添加
        </span>
        <Button
          type="primary"
          style={{ float: 'right' }}
          onClick={() => history.push(createWebhookURL)}
        >
          创建
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={webhookTableData}
        pagination={{
          position: ['bottomCenter'],
          current: pageNumber,
          hideOnSinglePage: true,
          total,
          onChange: (page) => setPageNumber(page),
        }}
      />
    </PageWithBreadcrumb>
  );
}

export default PageWithInitialState(WebhookList);
