import {
  Button, Card, Table,
} from 'antd';
import { useRequest } from '@@/plugin-request/request';
import { useHistory, useIntl } from 'umi';
import { CardTitle } from '../Widget';
import { BoldText } from '@/components/Widget';
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
  const intl = useIntl();

  const { data: tags } = useRequest(() => getClusterTags(clusterID));

  const { data: adminTags } = useRequest(() => getClusterTemplateSchemaTags(clusterID));

  const manageTagsRoute = `/clusters${clusterFullPath}/-/tags`;
  const manageAdminTagsRoute = `/clusters${clusterFullPath}/-/admintags`;
  const tagColumns = [
    {
      title: <BoldText>{intl.formatMessage({ id: 'pages.tags.key' })}</BoldText>,
      dataIndex: 'key',
      key: 'key',
      width: '30%',
      className: styles.tableHeader,
    },
    {
      title: <BoldText>{intl.formatMessage({ id: 'pages.tags.value' })}</BoldText>,
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
            <CardTitle>{intl.formatMessage({ id: 'pages.tags.normal' })}</CardTitle>
            <div style={{ flex: 1 }} />
            <Button
              disabled={!RBAC.Permissions.updateTags.allowed}
              onClick={
                  () => history.push({
                    pathname: manageTagsRoute,
                  })
                }
            >
              {intl.formatMessage({ id: 'pages.tags.normal.manage' })}
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
            <CardTitle>{intl.formatMessage({ id: 'pages.tags.admin' })}</CardTitle>
            <div style={{ flex: 1 }} />
            <Button
              disabled={!RBAC.Permissions.updateTemplateSchemaTags.allowed}
              onClick={
                  () => history.push({
                    pathname: manageAdminTagsRoute,
                  })
                }
            >
              {intl.formatMessage({ id: 'pages.tags.admin.manage' })}
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
