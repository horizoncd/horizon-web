import { Modal, Switch } from 'antd';
import { useIntl, useModel } from 'umi';
import { updateUserByID } from '@/services/users/users';

export default function AdminSwitch(props: { id: number, isAdmin: boolean, onSwith: (checked: boolean) => void }) {
  const { id, isAdmin, onSwith } = props;
  const intl = useIntl();
  const { successAlert } = useModel('alert');
  const onChange = (newPermission: boolean) => {
    Modal.confirm(
      {
        title: 'Admin',
        content: intl.formatMessage({ id: 'pages.admin.update.message' }),
        onOk: () => {
          updateUserByID(id, newPermission).then(() => {
            onSwith(newPermission);
            successAlert(intl.formatMessage({ id: 'pages.admin.update.success' }));
          });
        },
      },
    );
  };
  return <Switch key={id} checked={isAdmin} onChange={onChange} />;
}
