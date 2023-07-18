import { useModel, useIntl } from 'umi';
import { useRequest } from '@@/plugin-request/request';
import { history } from '@@/core/history';
import {
  Button, Card, Modal, Space,
} from 'antd';
import DetailCard from '@/components/DetailCard';
import type { Param } from '@/components/DetailCard';
import { deleteTemplate, queryReleases, queryTemplate } from '@/services/templates/templates';
import { ReleasesTable } from '../Releases';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import RBAC from '@/rbac';
import { ResourceType } from '@/const';
import { PageWithInitialState } from '@/components/Enhancement';
import { API } from '@/services/typings';

function TemplateDetail(props: { initialState: API.InitialState }) {
  const { initialState: { resource: { type, fullName, id: templateID } } } = props;
  const intl = useIntl();
  const { successAlert } = useModel('alert');
  const { data: template } = useRequest(() => queryTemplate(templateID), {});
  const { data: releases, refresh } = useRequest(() => queryReleases(templateID));
  const isRootGroup = type === ResourceType.TEMPLATE && template?.group === 0;

  const formatMessage = (suffix: string) => intl.formatMessage({ id: `pages.template.${suffix}` });

  const data: Param[][] = [
    [
      {
        key: formatMessage('name'),
        value: template?.name,
      },
      {
        key: formatMessage('description'),
        value: template?.description,
      },
      {
        key: formatMessage('gitRepo'),
        value: template?.repository,
      },
    ],
    [
      {
        key: formatMessage('type'),
        value: (() => {
          switch (template?.type) {
            case 'database':
              return intl.formatMessage({ id: 'pages.catalog.database' });
              break;
            case 'middleware':
              return intl.formatMessage({ id: 'pages.catalog.middleware' });
              break;
            case 'workload':
              return intl.formatMessage({ id: 'pages.catalog.workload' });
              break;
            case 'other':
              return intl.formatMessage({ id: 'pages.catalog.other' });
              break;
            case 'v1':
              return intl.formatMessage({ id: 'pages.catalog.v1' });
              break;
            default:
              return '';
          }
        })(),
      },
      {
        key: formatMessage('createdAt'),
        value: new Date(template?.createdAt || '').toLocaleString(),
      },
      {
        key: formatMessage('updatedAt'),
        value: new Date(template?.updatedAt || '').toLocaleString(),
      },
    ],
  ];

  let queryInput: React.ReactElement | null = (
    <Button
      type="primary"
      style={{ marginBottom: 10, float: 'right', marginRight: 5 }}
      onClick={() => {
        history.push(`/templates/${fullName}/-/newrelease`);
      }}
    >
      {formatMessage('newRelease')}
    </Button>
  );

  if (!RBAC.Permissions.createRelease.allowed) {
    queryInput = null;
  }

  return (
    <PageWithBreadcrumb>
      <DetailCard
        title={intl.formatMessage({ id: 'pages.common.basicInfo' })}
        data={data}
        extra={(
          <Space>
            <Button
              type="primary"
              disabled={!RBAC.Permissions.updateTemplate.allowed}
              onClick={() => {
                history.push(`/templates/${fullName}/-/edit`);
              }}
            >
              {intl.formatMessage({ id: 'pages.common.edit' })}
            </Button>
            <Button
              danger
              type="primary"
              disabled={!RBAC.Permissions.deleteTemplate.allowed}
              onClick={() => {
                Modal.confirm({
                  title: intl.formatMessage({ id: 'pages.message.template.delete.confirm' }, { template: template?.name }),
                  content: intl.formatMessage({ id: 'pages.message.template.delete.content' }),
                  onOk: () => {
                    deleteTemplate(templateID).then(() => {
                      successAlert(intl.formatMessage({ id: 'pages.message.template.delete.success' }));
                      if (isRootGroup) {
                        history.push('/templates');
                      } else {
                        const path = fullName.split('/');
                        let res = '';
                        for (let i = 0; i < path.length - 1; i += 1) {
                          res += `/${path[i]}`;
                        }
                        window.location.href = res;
                      }
                    });
                  },
                });
              }}
            >
              {intl.formatMessage({ id: 'pages.common.delete' })}
            </Button>
          </Space>
    )}
      />

      {
        releases && (
          <Card title="Releases" extra={queryInput}>
            <ReleasesTable fullName={fullName} releases={releases} refresh={refresh} />
          </Card>
        )
      }
    </PageWithBreadcrumb>
  );
}

export default PageWithInitialState(TemplateDetail);
