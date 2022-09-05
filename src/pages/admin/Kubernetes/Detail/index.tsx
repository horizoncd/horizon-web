import { useParams } from 'umi';
import { useRequest } from '@@/plugin-request/request';
import { history } from '@@/core/history';
import {
  Button, Card, Modal, Popover, Space,
} from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import TextArea from 'antd/es/input/TextArea';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import {
  deleteRegionByID,
  getRegionByID,
  getRegionTags,
  updateRegionTags,
} from '@/services/regions/regions';
import Utils from '@/utils';
import NotFount from '@/pages/404';
import DetailCard, { Param } from '@/components/DetailCard';
import DynamicTagForm, { ValueType } from '@/components/DynamicTagForm';

export default () => {
  const params = useParams<{ id: string }>();
  if (!params.id || isNaN(parseInt(params.id))) {
    return <NotFount />;
  }

  const { successAlert } = useModel('alert');
  const regionID = parseInt(params.id);
  const { data: region } = useRequest(() => getRegionByID(regionID), {});

  const data: Param[][] = [
    [
      {
        key: '名称',
        value: region?.name,
      },
      {
        key: '中文名',
        value: region?.displayName,
      },
      {
        key: 'server',
        value: region?.server,
      },
      {
        key: 'harbor',
        value: region?.harbor.name,
      },
    ],
    [
      {
        key: 'ingress域名',
        value: region?.ingressDomain,
      },
      {
        key: 'certificate',
        value: <Popover
          overlayInnerStyle={{ width: 800 }}
          title={
            <TextArea value={region?.certificate} autoSize={{ minRows: 5 }} />
        }
          placement="bottom"
        >
          鼠标悬停查看
        </Popover>,
      },
      {
        key: '启用状态',
        value: region?.disabled ? <span style={{ color: 'red' }}>已禁用</span> : '启用中',
      },
    ],
    [
      {
        key: '创建时间',
        value: Utils.timeToLocal(region?.createdAt || ''),
      },
      {
        key: '修改时间',
        value: Utils.timeToLocal(region?.updatedAt || ''),
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
                history.push(`/admin/kubernetes/${regionID}/edit`);
              }}
            >
              编辑
            </Button>
            <Button
              danger
              onClick={() => {
                Modal.confirm({
                  title: `确认删除Kubernetes: ${region?.name}`,
                  content: '此为危险操作！如果某个环境已将此kubernetes设置为默认部署Kubernetes，将导致该环境失去默认部署kubernetes，需要选择其他Kubernetes作为默认部署Kubernetes',
                  onOk: () => {
                    deleteRegionByID(regionID).then(() => {
                      successAlert('Kubernetes 删除成功');
                      history.push('/admin/kubernetes');
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
      <Card title="标签管理">
        <DynamicTagForm
          queryTags={() => getRegionTags(regionID)}
          updateTags={(tags) => updateRegionTags(regionID, tags)}
          valueType={ValueType.Single}
        />
      </Card>
    </PageWithBreadcrumb>
  );
};
