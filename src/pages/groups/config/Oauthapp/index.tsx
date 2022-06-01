import {Button, Table} from 'antd'
// import RBAC from "@/rbac";
import {history} from "@@/core/history";
import {useModel} from "@@/plugin-model/useModel";
import {useIntl} from "@@/plugin-locale/localeExports";
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import styles from "@/pages/groups/config/Oauthapp/index.less";
import type {ColumnsType} from 'antd/lib/table';
import {useRequest} from "@@/plugin-request/request";
import {list} from "@/services/oauthapp/oauthapp"

export default () => {
  const intl = useIntl();

  const {initialState} = useModel('@@initialState');
  const groupID = initialState!.resource.id
  const {fullPath: fullPath} = initialState!.resource;
  const newOauthApp = `/groups${fullPath}/-/newoauthapp`

  const {data: cdata} = useRequest(() => list(groupID));
  const columns: ColumnsType<API.APPBasicInfo> = [
    {
      title: 'Name',
      dataIndex: 'appName',
      key: 'appName',
      render: text => <a>{text}</a>,
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
    }
  ]

  return (
    <PageWithBreadcrumb>
      <div>
        <h2>OAuth apps</h2>
        <Button
          className={styles.flex}
          type="primary"
          // disabled={!RBAC.Permissions.createApplication.allowed}
          onClick={() => {
            history.push({
              pathname: newOauthApp,
            });
          }}>
          {intl.formatMessage({id: 'pages.groups.New application'})}
        </Button>
        <Table columns={columns} dataSource={cdata}/>
      </div>
    </PageWithBreadcrumb>
  )
};
