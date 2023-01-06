import {
  Avatar, Button, Divider, Tooltip,
} from 'antd';
import { history } from 'umi';
import copy from 'copy-to-clipboard';
import { useModel } from '@@/plugin-model/useModel';
import { useIntl } from '@@/plugin-locale/localeExports';
import RBAC from '@/rbac';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import GroupTree from '@/components/GroupTree';
import styles from '@/pages/applications/Detail/index.less';
import utils from '../../../utils';
import './index.less';

export default () => {
  const intl = useIntl();

  const { initialState } = useModel('@@initialState');
  const { id: groupID, name: groupName, fullPath } = initialState!.resource;
  const newGroup = `/groups${fullPath}/-/newsubgroup`;
  const newApplication = `/groups${fullPath}/-/newapplicationv1`;
  // const newApplicationV2 = `/groups${fullPath}/-/newapplicationv2`;

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
        style={{ marginRight: 15 }}
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
      {/* <Button
        disabled={!RBAC.Permissions.createApplication.allowed}
        onClick={() => {
          history.push({
            pathname: newApplicationV2,
          });
        }}
      >
        {intl.formatMessage({ id: 'pages.groups.New applicationV2' })}
      </Button> */}
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
            <Tooltip title={intl.formatMessage({ id: 'pages.groups.idcopy.message' })}>
              {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
              <span onClick={() => {
                copy(String(groupID));
                successAlert(intl.formatMessage({ id: 'pages.groups.idcopy.success' }));
              }}
              >
                {intl.formatMessage({ id: 'pages.groups.id' })}
                {': '}
                {groupID}
              </span>
            </Tooltip>
          </div>
        </div>
        <div className={styles.flex} />
        {header()}
      </div>
      <Divider className="group-divider" />
      <GroupTree
        groupID={groupID}
        tabPane={intl.formatMessage({ id: 'pages.groups.groupsAndApplications' })}
      />
    </PageWithBreadcrumb>
  );
};
