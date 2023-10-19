import {
  Button, Divider, Modal, Tooltip,
} from 'antd';
import copy from 'copy-to-clipboard';
import { ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useModel } from '@@/plugin-model/useModel';
import { useIntl } from '@@/plugin-locale/localeExports';
import styles from '@/pages/applications/Detail/index.less';
import RBAC from '@/rbac';
import DetailCard from '@/components/DetailCard';
import ResourceAvatar from '@/components/Widget/ResourceAvatar';
import { DangerText } from '@/components/Widget';

export default (props: any) => {
  const {
    id,
    name: applicationName,
    refreshApplication,
    delApplication,
    onEditClick,
    serviceDetail,
  } = props;
  const intl = useIntl();
  const { successAlert } = useModel('alert');

  const refreshButton = (
    <Button className={styles.button} onClick={refreshApplication}>
      <ReloadOutlined />
    </Button>
  );

  const editButton = (
    <Button
      type="primary"
      className={styles.button}
      disabled={!RBAC.Permissions.updateApplication.allowed}
      onClick={onEditClick}
    >
      {intl.formatMessage({ id: 'pages.applicationDetail.basic.edit' })}
    </Button>
  );

  const deleteButton = (
    <Button
      className={styles.button}
      disabled={!RBAC.Permissions.deleteApplication.allowed}
      onClick={() => {
        Modal.confirm({
          title: intl.formatMessage(
            { id: 'pages.applicationDelete.confirm.title' },
            {
              application: (
                <span className={styles.bold}>
                  {applicationName}
                </span>
              ),
            },
          ),
          icon: <ExclamationCircleOutlined />,
          content: (
            <div className={styles.bold}>
              {intl.formatMessage({ id: 'pages.applicationDelete.confirm.content' })}
            </div>
          ),
          okText: intl.formatMessage({ id: 'pages.applicationDelete.confirm.ok' }),
          cancelText: intl.formatMessage({ id: 'pages.applicationDelete.confirm.cancel' }),
          onOk: () => {
            delApplication();
          },
        });
      }}
    >
      <DangerText>{intl.formatMessage({ id: 'pages.applicationDetail.basic.delete' })}</DangerText>
    </Button>
  );

  return (
    <div>
      <div>
        <div className={styles.avatarBlock}>
          <ResourceAvatar name={applicationName} size={64} />
          <div className={styles.flexColumn}>
            <div className={styles.titleFont}>{applicationName}</div>
            <div className={styles.idFont}>
              <Tooltip title={intl.formatMessage({ id: 'pages.message.copyID.tooltip' })}>
                <Button
                  className={styles.hiddenButton}
                  onClick={() => {
                    copy(String(id));
                    successAlert(intl.formatMessage({ id: 'pages.message.copyID.success' }));
                  }}
                >
                  {intl.formatMessage({ id: 'pages.application.id' })}
                  {': '}
                  {id}
                </Button>
              </Tooltip>
            </div>
          </div>
          <div className={styles.flex} />
          {refreshButton}
          {editButton}
          {deleteButton}
        </div>
      </div>
      <Divider className={styles.groupDivider} />
      <DetailCard
        title={(
          <span className={styles.cardTitle}>
            {intl.formatMessage({ id: 'pages.applicationDetail.basic.detail' })}
          </span>
        )}
        data={serviceDetail}
      />
    </div>
  );
};
