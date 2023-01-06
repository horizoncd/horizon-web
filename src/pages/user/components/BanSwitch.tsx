import { Switch } from 'antd';
import { useIntl, useModel } from 'umi';
import { updateUserByID } from '@/services/users/users';

export default function BanSwitch(props: { id: number, isBanned: boolean, onSwith: (checked: boolean) => void }) {
  const intl = useIntl();
  const { id, isBanned, onSwith } = props;
  const { successAlert } = useModel('alert');
  const onChange = (newPermission: boolean) => {
    updateUserByID(id, undefined, newPermission).then(() => {
      onSwith(newPermission);
      successAlert(
        newPermission
          ? intl.formatMessage({ id: 'pages.admin.banned' })
          : intl.formatMessage({ id: 'pages.admin.unban' }),
      );
    });
  };
  return <Switch key={id} checked={isBanned} onChange={onChange} />;
}
