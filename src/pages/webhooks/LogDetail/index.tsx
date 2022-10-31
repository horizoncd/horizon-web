import { Card, Divider } from 'antd';
import { useParams, useRequest } from 'umi';
import styled from 'styled-components';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import { getWebhookLog } from '@/services/webhooks/webhooks';
import utils from '@/utils';

const Title = styled.span`
  font-weight: bold;
  font-size: '20px';
`;

const BasicInfo = styled.div`
  margin-block: 15px;
`;

// this style refers to gitlab
const ContentBlock = styled.pre`
  background-color: #fafafa;
  border-radius: 2px;
  border: 1px solid #dbdbdb;
  padding: 8px 12px;
  font-size: 0.8125rem;
`;

function LogList() {
  const { id: idStr } = useParams<{ id: string }>();
  const id = parseInt(idStr, 10);
  const { data: webhookLog } = useRequest(
    () => getWebhookLog(
      id,
    ),
    { },
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
        Webhook触发记录详情
      </div>
      <Card>
        <BasicInfo>
          <Title>
            请求URL：
          </Title>
          <span>
            {webhookLog?.url}
          </span>
        </BasicInfo>
        <BasicInfo>
          <Title>
            触发条件：
          </Title>
          <span>
            {webhookLog?.trigger}
          </span>
        </BasicInfo>
        <BasicInfo>
          <Title>
            时长：
          </Title>
          <span>
            {utils.timeSecondsDuration(webhookLog?.createdAt || '', webhookLog?.updatedAt || '')}
            s
          </span>
        </BasicInfo>
        <BasicInfo>
          <Title>
            发送时间：
          </Title>
          <span>
            {webhookLog?.createdAt}
          </span>
        </BasicInfo>
        <Divider />
        <Title>
          请求头
        </Title>
        <ContentBlock>
          {webhookLog?.requestHeaders}
        </ContentBlock>
        <Title>
          请求体
        </Title>
        <ContentBlock>
          {JSON.stringify(JSON.parse(webhookLog?.requestData || '{}'), null, 4)}
        </ContentBlock>
        <Title>
          返回头
        </Title>
        <ContentBlock>
          {webhookLog?.responseHeaders}
        </ContentBlock>
        <Title>
          返回体
        </Title>
        <ContentBlock>
          {webhookLog?.responseBody}
        </ContentBlock>
      </Card>
    </PageWithBreadcrumb>
  );
}

export default LogList;
