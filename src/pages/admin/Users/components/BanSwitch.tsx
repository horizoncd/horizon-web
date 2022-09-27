import { Switch } from 'antd';
import { useModel } from 'umi';
import { updateUserByID } from '@/services/users/users';

export default function BanSwitch(props: { id: number, isBanned: boolean, onSwith: (checked: boolean) => void }) {
  const { id, isBanned, onSwith } = props;
  const { successAlert } = useModel('alert');
  const onChange = (newPermission: boolean) => {
    updateUserByID(id, undefined, newPermission).then(() => {
      onSwith(newPermission);
      successAlert(
        newPermission
          ? '用户已禁止登录'
          : '用户已解除禁止登录',
      );
    });
  };
  return <Switch key={id} checked={isBanned} onChange={onChange} />;
}
