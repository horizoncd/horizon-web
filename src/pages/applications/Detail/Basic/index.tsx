import {
  Avatar, Button, Divider, Dropdown, Menu, Modal, Tooltip,
} from 'antd';
import copy from 'copy-to-clipboard';
import { DownOutlined, ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useModel } from '@@/plugin-model/useModel';
import { useIntl } from '@@/plugin-locale/localeExports';
import styles from '@/pages/applications/Detail/index.less';
import utils from '@/utils';
import RBAC from '@/rbac';
import DetailCard from '@/components/DetailCard';

export default (props: any) => {
  const intl = useIntl();
  const {
    id, name: applicationName, refreshApplication,
    delApplication, onEditClick, serviceDetail,
  } = props;
  const { successAlert } = useModel('alert');
  const firstLetter = applicationName.substring(0, 1).toUpperCase();

  const operateDropdown = (
    <Menu>
      <Menu.Item
        disabled={!RBAC.Permissions.deleteApplication.allowed}
        onClick={() => {
          Modal.confirm({
            title: intl.formatMessage({ id: 'pages.applicationDelete.confirm.title' }, {
              application: (
                <span className={styles.bold}>
                  {' '}
                  {applicationName}
                </span>
              ),
            }),
            icon: <ExclamationCircleOutlined />,
            content: (
              <div
                className={styles.bold}
              >
                {intl.formatMessage({ id: 'pages.applicationDelete.confirm.content' })}
              </div>
            ),
            okText: intl.formatMessage({ id: 'pages.applicationDelete.confirm.ok' }),
            cancelText: intl.formatMessage({ id: 'pages.applicationDelete.confirm.cancel' }),
            onOk: () => {
              delApplication().then();
            },
          });
        }}
      >
        {intl.formatMessage({ id: 'pages.applicationDetail.basic.delete' })}
      </Menu.Item>
    </Menu>
  );
  return (
    <div>
      <div>
        <div className={styles.avatarBlock}>
          <Avatar
            className={`${styles.avatar} identicon bg${utils.getAvatarColorIndex(applicationName)}`}
            size={64}
            shape="square"
          >
            <span className={styles.avatarFont}>{firstLetter}</span>
          </Avatar>
          <div className={styles.flexColumn}>
            <div className={styles.titleFont}>{applicationName}</div>
            <div className={styles.idFont}>
              <Tooltip title="单击可复制ID">
                <Button
                  className={styles.hiddenButton}
                  onClick={() => {
                    copy(String(id));
                    successAlert('ID复制成功');
                  }}
                >
                  Application ID:
                  {' '}
                  {id}
                </Button>
              </Tooltip>
            </div>
          </div>
          <div className={styles.flex} />
          <Button className={styles.button} onClick={refreshApplication}><ReloadOutlined /></Button>
          <Button
            type="primary"
            className={styles.button}
            disabled={!RBAC.Permissions.updateApplication.allowed}
            onClick={onEditClick}
          >
            {intl.formatMessage({ id: 'pages.applicationDetail.basic.edit' })}
          </Button>
          <Dropdown
            className={styles.button}
            overlay={operateDropdown}
            trigger={['click']}
          >
            <Button>
              {intl.formatMessage({ id: 'pages.applicationDetail.basic.operate' })}
              <DownOutlined />
            </Button>
          </Dropdown>
        </div>
      </div>
      <Divider className={styles.groupDivider} />
      <DetailCard
        title={(
          <span className={styles.cardTitle}>{intl.formatMessage({ id: 'pages.applicationDetail.basic.detail' })}</span>)}
        data={serviceDetail}
      />
    </div>
  );
};
