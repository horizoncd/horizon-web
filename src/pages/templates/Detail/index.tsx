import { useModel } from 'umi';
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
import PageWithInitialState from '@/components/PageWithInitialState/PageWithInitialState';
import { API } from '@/services/typings';

function TemplateDetail(props: { initialState: API.InitialState }) {
  const { initialState: { resource: { type, fullName, id: templateID } } } = props;
  const { successAlert } = useModel('alert');
  const { data: template } = useRequest(() => queryTemplate(templateID), {});
  const { data: releases, refresh } = useRequest(() => queryReleases(templateID));
  const isRootGroup = type === ResourceType.TEMPLATE && template?.group === 0;

  const data: Param[][] = [
    [
      {
        key: '名称',
        value: template?.name,
      },
      {
        key: '描述',
        value: template?.description,
      },
      {
        key: '仓库',
        value: template?.repository,
      },
    ],
    [
      {
        key: '创建日期',
        value: new Date(template?.createdAt || '').toLocaleString(),
      },
      {
        key: '更新日期',
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
      创建release
    </Button>
  );

  if (!RBAC.Permissions.createRelease.allowed) {
    queryInput = null;
  }

  return (
    <PageWithBreadcrumb>
      <DetailCard
        title={<span>基础信息</span>}
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
              编辑
            </Button>
            <Button
              danger
              type="primary"
              disabled={!RBAC.Permissions.deleteTemplate.allowed}
              onClick={() => {
                Modal.confirm({
                  title: `确认删除Templates: ${template?.name}`,
                  content: '该版本template有可能正在被application或cluster使用，删除前请确认',
                  onOk: () => {
                    deleteTemplate(templateID).then(() => {
                      successAlert('删除Template成功');
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
              删除
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
