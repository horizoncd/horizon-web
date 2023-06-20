import {
  Button, Input, Modal, Table, Form, DatePicker, Card, Select, Checkbox, Divider,
} from 'antd';
import { useModel } from 'umi';
import { useRequest } from '@@/plugin-request/request';
import { useState } from 'react';
import { useIntl } from '@@/plugin-locale/localeExports';
import { Rule } from 'antd/lib/form';
import moment from 'moment';
import copy from 'copy-to-clipboard';
import { CopyOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { ResourceType } from '@/const';
import Label from '@/components/Label';
import PopupTime from '@/components/Widget/PopupTime';
import {
  createPersonalAccessToken, createResourceAccessToken, listPersonalAccessTokens, listResourceAccessTokens, listScopes, revokePersonalAccessToken, revokeResourceAccessToken,
} from '@/services/accesstoken/accesstoken';
import { API } from '@/services/typings';
import rbac from '@/rbac';

function AccessTokenManagement(props: { resourceType?: string, resourceID?: number, role?: string, resourceScope?: boolean }) {
  const {
    resourceType, resourceID, resourceScope, role,
  } = props;
  const intl = useIntl();
  const { successAlert, errorAlert } = useModel('alert');
  const [pageNumber, setPageNumber] = useState(1);
  const [tokenCode, setTokenCode] = useState('');
  const pageSize = 10;

  const { data: { items: accessTokens, total } = { total: 0, items: [] }, run: refreshAccessTokens } = useRequest(
    () => {
      if (resourceScope) {
        return listResourceAccessTokens({ pageNumber, pageSize }, resourceType!, resourceID!);
      }
      return listPersonalAccessTokens({ pageNumber, pageSize });
    },
  );

  const { roleRank, roleList } = rbac.GetRoleList();

  const { data: scopes = [] } = useRequest(
    () => listScopes(),
  );

  const required = [{
    required: true,
  }];

  const FormLabel = styled.span`
    font-weight: bold;
  `;

  const ImportantTxt = styled.div`
     color: chocolate;
     font-size: 15px;
     font-weight: bold;
     margin-bottom: 10px;
  `;

  const Description = styled.div`
    color: rgba(0, 0, 0, 0.45);
    font-size: '8px';
  `;

  const TokenListCard = styled(Card)`
     padding: 0;
  `;

  const NumberTab = styled.span`
  border-radius: 50%;
  background-color: #f0f0f0;
  margin-left: 2px;
  padding: 0 5px;
  border-width: 1px;
  `;

  const nameRules: Rule[] = [
    {
      required: true,
      pattern: /^(?=[a-z0-9])(([a-z0-9][-a-z0-9]*)?[a-z0-9])?$/,
      message: intl.formatMessage({ id: 'pages.accesstokens.name.ruleMessage' }),
      type: 'string',
      max: 40,
      min: 1,
    },
  ];

  let canCreate = false;
  if (!resourceScope) {
    canCreate = true;
  } else {
    const resourcePerssions = {
      [ResourceType.GROUP]: rbac.Permissions.createGroupAccessTokens.allowed,
      [ResourceType.APPLICATION]: rbac.Permissions.createApplicationAccessTokens.allowed,
      [ResourceType.INSTANCE]: rbac.Permissions.createClusterAccessTokens.allowed,
    };
    canCreate = resourcePerssions[resourceType!];
  }

  let canDelete = false;
  if (!resourceScope) {
    canDelete = true;
  } else {
    const resourcePerssions = {
      [ResourceType.GROUP]: rbac.Permissions.deleteGroupAccessTokens.allowed,
      [ResourceType.APPLICATION]: rbac.Permissions.deleteApplicationAccessTokens.allowed,
      [ResourceType.INSTANCE]: rbac.Permissions.deleteClusterAccessTokens.allowed,
    };
    canDelete = resourcePerssions[resourceType!];
  }

  const onFinish = (formData: ACCESSTOKEN.CreatePersonalAccessTokenReq | ACCESSTOKEN.CreateResourceAccessTokenReq) => {
    if (resourceScope) {
      createResourceAccessToken(formData as ACCESSTOKEN.CreateResourceAccessTokenReq, resourceType!, resourceID!).then(
        ({ data: resp }) => {
          successAlert(intl.formatMessage({ id: 'pages.accesstokens.operations.create.success' }));
          setTokenCode(resp.token);
          refreshAccessTokens();
        },
      );
    } else {
      createPersonalAccessToken(formData as ACCESSTOKEN.CreatePersonalAccessTokenReq).then(
        ({ data: resp }) => {
          successAlert(intl.formatMessage({ id: 'pages.accesstokens.operations.create.success' }));
          setTokenCode(resp.token);
          refreshAccessTokens();
        },
      );
    }
  };

  const onCopyClick = () => {
    if (copy(tokenCode)) {
      successAlert(intl.formatMessage({ id: 'pages.accesstokens.operations.copy.success' }));
    } else {
      errorAlert(intl.formatMessage({ id: 'pages.accesstokens.operations.copy.failed' }));
    }
  };

  const columns = [
    {
      title: 'id',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: intl.formatMessage({ id: 'pages.accesstokens.addToken.name.title' }),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: intl.formatMessage({ id: 'pages.accesstokens.addToken.scopes.title' }),
      dataIndex: 'scopes',
      key: 'scopes',
      width: '23%',
      render: (scopeNames: string[]) => (
        scopeNames.map((scopeName) => (
          <Label
            key={scopeName}
          >
            {scopeName}
          </Label>
        ))
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.accesstokens.addToken.expiresAt.title' }),
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (expiresAt: string) => {
        if (expiresAt !== 'never') {
          return (
            <PopupTime
              time={expiresAt}
            />
          );
        }
        return <div>never</div>;
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.accesstokens.tokenList.createdBy.title' }),
      dataIndex: 'createdBy',
      key: 'createdBy',
      render: (createdBy: API.User) => (
        <div>
          {createdBy.name}
        </div>
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.accesstokens.tokenList.createdAt.title' }),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string) => (
        <PopupTime
          time={createdAt}
        />
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.accesstokens.operations.operation.title' }),
      key: 'operation',
      render: (record: ACCESSTOKEN.PersonalAccessToken | ACCESSTOKEN.ResourceAccessToken) => (
        <Button
          disabled={!canDelete || (resourceScope && roleRank.get((record as ACCESSTOKEN.ResourceAccessToken).role) < roleRank.get(role))}
          type="link"
          onClick={() => Modal.confirm({
            title: intl.formatMessage({ id: 'pages.accesstokens.operations.delete.prompt' }),
            content: `${record.name}`,
            onOk: () => {
              if (resourceScope) {
                revokeResourceAccessToken(record.id).then(() => {
                  successAlert(intl.formatMessage({ id: 'pages.accesstokens.operations.delete.success' }));
                  refreshAccessTokens();
                });
              } else {
                revokePersonalAccessToken(record.id).then(() => {
                  successAlert(intl.formatMessage({ id: 'pages.accesstokens.operations.delete.success' }));
                  refreshAccessTokens();
                });
              }
            },
          })}
        >
          {intl.formatMessage({ id: 'pages.accesstokens.operations.delete.title' })}
        </Button>
      ),
    },
  ];

  if (resourceScope) {
    columns.splice(3, 0, {
      title: intl.formatMessage({ id: 'pages.accesstokens.addToken.role.title' }),
      dataIndex: 'role',
      key: 'role',
    });
  }

  return (
    <>
      <h1>
        {resourceScope ? 'Access Token' : 'Personal Access Token'}
      </h1>
      <Description>
        {intl.formatMessage({ id: 'pages.accesstokens.desc' })}
      </Description>
      <Divider />
      <Card
        hidden={!canCreate}
        tabList={[{
          key: 'createAccessToken',
          tab: (
            <div>
              {intl.formatMessage({ id: 'pages.accesstokens.addToken.title' })}
            </div>
          ),
        }]}
      >
        <Form
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label={<FormLabel>{intl.formatMessage({ id: 'pages.accesstokens.addToken.name.title' })}</FormLabel>}
            name="name"
            rules={nameRules}
          >
            <div>
              <Input />
            </div>
          </Form.Item>
          <Form.Item
            label={<FormLabel>{intl.formatMessage({ id: 'pages.accesstokens.addToken.expiresAt.title' })}</FormLabel>}
            name="expiresAt"
            getValueFromEvent={(value) => (!value ? 'never' : moment(value).format('YYYY-MM-DD'))}
            valuePropName="date"
            initialValue="never"
          >
            <DatePicker
              style={{ display: 'flex' }}
              placeholder={intl.formatMessage({ id: 'pages.accesstokens.addToken.expiresAt.desc' })}
              format="YYYY-MM-DD"
              allowClear
              disabledDate={(current) => current <= moment()}
            />
          </Form.Item>
          {
            resourceScope && (
              <Form.Item
                label={<FormLabel>{intl.formatMessage({ id: 'pages.accesstokens.addToken.role.title' })}</FormLabel>}
                name="role"
                rules={required}
              >
                <Select
                  options={roleList.slice(roleRank.get(role!)).map((r: string) => ({ key: r, label: r, value: r }))}
                />
              </Form.Item>
            )
          }
          <Form.Item
            label={<FormLabel>{intl.formatMessage({ id: 'pages.accesstokens.addToken.scopes.title' })}</FormLabel>}
            name="scopes"
            rules={required}
          >
            <Checkbox.Group>
              {
                scopes.map((scope) => (
                  <>
                    <Checkbox
                      value={scope.name}
                    >
                      {scope.name}
                    </Checkbox>
                    <Description
                      style={{ marginBottom: '20px', marginLeft: '10px' }}
                    >
                      {scope.desc}
                    </Description>
                  </>
                ))
              }
            </Checkbox.Group>
          </Form.Item>
          {/* <div>
          {intl.formatMessage({ id: 'pages.accesstokens.addToken.scopes.desc' })}
        </div> */}
          <Button
            type="primary"
            htmlType="submit"
          >
            {intl.formatMessage({ id: 'pages.accesstokens.addToken.add' })}
          </Button>
        </Form>
      </Card>
      {
        tokenCode && (
          <>
            <Divider />
            <ImportantTxt>
              {intl.formatMessage({ id: 'pages.accesstokens.addToken.code.title' })}
            </ImportantTxt>
            <Input
              disabled
              value={tokenCode}
              style={{ width: '500px' }}
            />
            <Button onClick={onCopyClick} icon={<CopyOutlined />} />
          </>
        )
      }
      <TokenListCard
        bordered={false}
        activeTabKey="accessTokenList"
        tabList={[{
          key: 'accessTokenList',
          tab: (
            <div>
              {intl.formatMessage({ id: 'pages.accesstokens.tokenList.title' })}
              <NumberTab>
                {total}
              </NumberTab>
            </div>
          ),
        }]}
      >
        <Table
          columns={columns}
          dataSource={accessTokens}
          rowKey="id"
          pagination={{
            position: ['bottomCenter'],
            current: pageNumber,
            hideOnSinglePage: true,
            total,
            onChange: (page) => setPageNumber(page),
          }}
        />
      </TokenListCard>
    </>
  );
}

AccessTokenManagement.defaultProps = {
  resourceScope: false,
  resourceType: '',
  resourceID: 0,
  role: '',
};

export default AccessTokenManagement;
