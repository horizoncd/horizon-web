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

export default () => {
  const { initialState } = useModel('@@initialState');

  const { type, fullName, id: templateID } = initialState?.resource;
  const { data: template } = useRequest(() => queryTemplate(templateID), {});
  const { data: releases } = useRequest(() => queryReleases(templateID));
  const isRootGroup = type === ResourceType.GROUP && template?.group === 0;

  const data: Param[][] = [
    [
      {
        key: '名称',
        value: template?.name,
      },
      {
        key: 'Harbor包名',
        value: template?.chartName,
      },
      {
        key: '描述',
        value: template?.description,
      },
    ],
    [
      {
        key: '创建日期',
        value: new Date(template?.createAt || '').toLocaleString(),
      },
      {
        key: '更新日期',
        value: new Date(template?.updateAt || '').toLocaleString(),
      },
      {
        key: '仓库',
        value: template?.repository,
      },
    ],
  ];

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
              disabled={!RBAC.Permissions.deleteTemplate.allowed}
              onClick={() => {
                Modal.confirm({
                  title: `确认删除Templates: ${template?.name}`,
                  content: '该版本template有可能正在被application或cluster使用，删除前请确认',
                  onOk: () => {
                    deleteTemplate(templateID).then(() => {
                      Modal.success({
                        title: 'Template',
                        content: '删除Template成功！',
                        afterClose: () => {
                          if (isRootGroup) {
                            history.push('/templates');
                          } else {
                            const path = fullName.split('/');
                            let res = '';
                            for (let i = 0; i < path.length - 1; i++) {
                              res += `/${path[i]}`;
                            }
                            window.location.href = res;
                          }
                        },
                      });
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
      <Card title="Releases">
        <ReleasesTable fullName={fullName} releases={releases} currentUser={initialState.currentUser} />
      </Card>
    </PageWithBreadcrumb>
  );
};
