import { useParams } from 'umi';
import { useRequest } from '@@/plugin-request/request';
import { history } from '@@/core/history';
import { Button, Modal, Space } from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import Utils from '@/utils';
import { deleteRegistryByID, getRegistryByID } from '@/services/registries/registries';
import NotFount from '@/pages/404';
import DetailCard, { Param } from '@/components/DetailCard';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';

export default () => {
  const params = useParams<{ id: string }>();
  if (!params.id || isNaN(parseInt(params.id, 10))) {
    return <NotFount />;
  }

  const { successAlert } = useModel('alert');
  const registryID = parseInt(params.id, 10);
  const { data: registry } = useRequest(() => getRegistryByID(registryID), {});

  const data: Param[][] = [
    [
      {
        key: '名称',
        value: registry?.name,
      },
      {
        key: 'server',
        value: registry?.server,
      },
      {
        key: 'path',
        value: registry?.path,
      },
      {
        key: 'token',
        value: registry?.token,
      },
    ],
    [
      {
        key: '跳过TLS认证',
        value: JSON.stringify(registry?.insecureSkipTLSVerify),
      },
      {
        key: 'registry类型',
        value: registry?.kind,
      },
      {
        key: '创建时间',
        value: Utils.timeToLocal(registry?.createdAt || ''),
      },
      {
        key: '修改时间',
        value: Utils.timeToLocal(registry?.updatedAt || ''),
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
              onClick={() => {
                history.push(`/admin/registries/${registryID}/edit`);
              }}
            >
              编辑
            </Button>
            <Button
              danger
              onClick={() => {
                Modal.confirm({
                  title: `确认删除Registry: ${registry?.name}`,
                  onOk: () => {
                    deleteRegistryByID(registryID).then(() => {
                      successAlert('Registry 删除成功');
                      history.push('/admin/registries');
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
    </PageWithBreadcrumb>
  );
};
