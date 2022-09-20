import { Button, Modal, Table } from 'antd';
import { history } from '@@/core/history';
import { useModel } from '@@/plugin-model/useModel';
import { useIntl } from '@@/plugin-locale/localeExports';
import type { ColumnsType } from 'antd/lib/table';
import { useRequest } from '@@/plugin-request/request';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import styles from '@/pages/groups/config/Oauthapp/index.less';
import { deleteOauthApp, list } from '@/services/oauthapp/oauthapp';
import RBAC from '@/rbac';

export default () => {
  const intl = useIntl();

  const { initialState } = useModel('@@initialState');
  const groupID = initialState!.resource.id;
  const { fullPath } = initialState!.resource;
  const newOauthApp = `/groups${fullPath}/-/newoauthapp`;

  const { data: cdata, run: runList } = useRequest(() => list(groupID));
  const columns: ColumnsType<API.APPBasicInfo> = [
    {
      title: 'Name',
      dataIndex: 'appName',
      key: 'appName',
      render: (text, row) => (
        <a href={`/groups${fullPath}/-/settings/oauthapps/${row.clientID}`}>
          {text}
        </a>
      ),
    },
    {
      title: 'clientID',
      dataIndex: 'clientID',
      key: 'clientID',
    },
    {
      title: 'homeURL',
      dataIndex: 'homeURL',
      key: 'homeURL',
    },
    {
      title: 'redirectURL',
      dataIndex: 'redirectURL',
      key: 'redirectURL',
    },
    {
      render: (text, row) => {
        function onDelete() {
          deleteOauthApp(row.clientID).then(() => {
            runList();
          });
        }

        return (
          <Button
            className={styles.buttom}
            danger
            disabled={!RBAC.Permissions.deleteOauthApplication.allowed}
            style={RBAC.Permissions.deleteOauthApplication.allowed ? { backgroundColor: '#dd2b0e', color: 'white' } : {}}
            onClick={() => {
              Modal.confirm({
                title: 'Delete',
                content: 'This action cannot be undone. This oauth will stop working immediately. Are you sure you want to delete this oauth app  ?',
                icon: <ExclamationCircleOutlined />,
                okText: <div>OK</div>,
                cancelText: <div>Cancel</div>,
                onOk: onDelete,
              });
            }}
          >
            Delete
          </Button>
        );
      },
    },
  ];

  return (
    <PageWithBreadcrumb>
      <div>
        <h2>OAuth apps</h2>
        <p>Manage Oauth app that can use Horizon as an OAuth provider.</p>
        <Button
          type="primary"
          className={styles.flex}
          disabled={!RBAC.Permissions.createOauthApplication.allowed}
          onClick={() => {
            history.push({
              pathname: newOauthApp,
            });
          }}
        >
          {intl.formatMessage({ id: 'pages.groups.New application' })}
        </Button>
        <Table columns={columns} dataSource={cdata} />
      </div>
    </PageWithBreadcrumb>
  );
};
