import {
  Button, Card, Table,
} from 'antd';
import { useRequest } from '@@/plugin-request/request';
import { useHistory } from 'umi';
import { CardTitle, BoldText } from '../Widget';
import styles from '../index.less';
import RBAC from '@/rbac';
import {
  getClusterTags,
  getClusterTemplateSchemaTags,
} from '@/services/clusters/clusters';
import { MaxSpace } from '@/components/Widget';

export default function Tag(props: any) {
  const { clusterID, clusterFullPath } = props;

  const history = useHistory();

  const { data: tags } = useRequest(() => getClusterTags(clusterID));

  const { data: adminTags } = useRequest(() => getClusterTemplateSchemaTags(clusterID));

  const manageTagsRoute = `/clusters${clusterFullPath}/-/tags`;
  const manageAdminTagsRoute = `/clusters${clusterFullPath}/-/admintags`;
  const tagColumns = [
    {
      title: <BoldText>键</BoldText>,
      dataIndex: 'key',
      key: 'key',
      width: '30%',
      className: styles.tableHeader,
    },
    {
      title: <BoldText>值</BoldText>,
      dataIndex: 'value',
      key: 'value',
      width: '70%',
      className: styles.tableHeader,
    },
  ];

  return (
    <MaxSpace
      direction="vertical"
      size="middle"
    >
      <Card
        title={(
          <div style={{ display: 'flex' }}>
            <CardTitle>标签</CardTitle>
            <div style={{ flex: 1 }} />
            <Button
              disabled={!RBAC.Permissions.updateTags.allowed}
              onClick={
                  () => history.push({
                    pathname: manageTagsRoute,
                  })
                }
            >
              管理标签
            </Button>
          </div>
        )}
        type="inner"
      >
        <Table
          tableLayout="fixed"
          dataSource={tags?.tags}
          columns={tagColumns}
        />
      </Card>
      <Card
        title={(
          <div style={{ display: 'flex' }}>
            <CardTitle>管理员标签</CardTitle>
            <div style={{ flex: 1 }} />
            <Button
              disabled={!RBAC.Permissions.updateTemplateSchemaTags.allowed}
              onClick={
                  () => history.push({
                    pathname: manageAdminTagsRoute,
                  })
                }
            >
              管理标签
            </Button>
          </div>
        )}
        type="inner"
      >
        <Table
          tableLayout="fixed"
          dataSource={adminTags?.tags}
          columns={tagColumns}
        />
      </Card>
    </MaxSpace>
  );
}
