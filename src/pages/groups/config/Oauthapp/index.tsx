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
      title: intl.formatMessage({ id: 'pages.common.name' }),
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
                title: intl.formatMessage({ id: 'pages.common.delete' }),
                content: intl.formatMessage({ id: 'pages.message.oauth.delete.hint' }),
                icon: <ExclamationCircleOutlined />,
                okText: intl.formatMessage({ id: 'pages.common.confirm' }),
                cancelText: intl.formatMessage({ id: 'pages.common.cancel' }),
                onOk: onDelete,
              });
            }}
          >
            {intl.formatMessage({ id: 'pages.common.delete' })}
          </Button>
        );
      },
    },
  ];

  return (
    <PageWithBreadcrumb>
      <div>
        <h2>{intl.formatMessage({ id: 'pages.oauth.title' })}</h2>
        <p>{intl.formatMessage({ id: 'pages.message.oauth.hint' })}</p>
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
