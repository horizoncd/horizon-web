import { Button, Modal } from 'antd';
import { history, useModel } from 'umi';
import { deleteIDP } from '@/services/idps';

export function IDPEditButton(props: { id: number }) {
  const { id } = props;
  return (
    <Button
      type="primary"
      onClick={
        () => {
          history.push(`/admin/idps/${id}/edit`);
        }
    }
    >
      编辑
    </Button>
  );
}

export function IDPDeleteButton(props: { id: number, onSuccess?: () => void }) {
  const { id, onSuccess } = props;
  const { successAlert } = useModel('alert');
  const onDelete = () => {
    Modal.confirm({
      title: '确认删除',
      content: '该操作无法恢复请谨慎操作',
      onOk: () => {
        deleteIDP(id)
          .then(() => {
            successAlert('删除成功');
          })
          .then(onSuccess)
          .then(() => {
            history.go(0);
          });
      },
    });
  };

  return (
    <Button
      type="primary"
      danger
      onClick={onDelete}
    >
      删除
    </Button>
  );
}

IDPDeleteButton.defaultProps = {
  onSuccess: () => {},
};

export function IDPNewButton() {
  return (
    <Button
      type="primary"
      onClick={
                () => {
                  history.push('/admin/idps/new');
                }
              }
    >
      新建OIDC登录方式
    </Button>
  );
}
