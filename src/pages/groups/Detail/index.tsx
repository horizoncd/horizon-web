import {
  Avatar, Button, Divider, Tooltip,
} from 'antd';
import { history } from 'umi';
import copy from 'copy-to-clipboard';
import utils from '../../../utils';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import './index.less';
import GroupTree from '@/components/GroupTree';
import { useModel } from '@@/plugin-model/useModel';
import { useIntl } from '@@/plugin-locale/localeExports';
import RBAC from '@/rbac';
import styles from '@/pages/applications/Detail/index.less';

export default () => {
  const intl = useIntl();

  const { initialState } = useModel('@@initialState');
  const { id: groupID, name: groupName, fullPath } = initialState!.resource;
  const newGroup = `/groups${fullPath}/-/newsubgroup`;
  const newApplication = `/groups${fullPath}/-/newapplication`;
  const { successAlert } = useModel('alert');

  const header = () => (
    <div>
      <Button
        disabled={!RBAC.Permissions.createGroup.allowed}
        style={{ marginRight: 15 }}
        onClick={() => history.push({
          pathname: newGroup,
        })}
      >
        {intl.formatMessage({ id: 'pages.groups.New subgroup' })}
      </Button>
      <Button
        type="primary"
        disabled={!RBAC.Permissions.createApplication.allowed}
        onClick={() => {
          history.push({
            pathname: newApplication,
          });
        }}
      >
        {intl.formatMessage({ id: 'pages.groups.New application' })}
      </Button>
    </div>
  );

  const firstLetter = groupName.substring(0, 1).toUpperCase();

  return (
    <PageWithBreadcrumb>
      <div className={styles.avatarBlock}>
        <Avatar
          className={`${styles.avatar} identicon bg${utils.getAvatarColorIndex(groupName)}`}
          size={64}
          shape="square"
        >
          <span className={styles.avatarFont}>{firstLetter}</span>
        </Avatar>
        <div className={styles.flexColumn}>
          <div className={styles.titleFont}>{groupName}</div>
          <div className={styles.idFont}>
            <Tooltip title="单击可复制ID">
              <span onClick={() => {
                copy(String(groupID));
                successAlert('ID复制成功');
              }}
              >
                Group ID:
                {' '}
                {groupID}
              </span>
            </Tooltip>
          </div>
        </div>
        <div className={styles.flex} />
        {header()}
      </div>
      <Divider className="group-divider" />
      <GroupTree groupID={groupID} tabPane="子分组和应用" />
    </PageWithBreadcrumb>
  );
};
