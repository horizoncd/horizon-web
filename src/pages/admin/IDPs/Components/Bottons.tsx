import { Button, Modal } from 'antd';
import { history, useIntl, useModel } from 'umi';
import { deleteIDP } from '@/services/idps';

export function IDPEditButton(props: { id: number }) {
  const intl = useIntl();
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
      {intl.formatMessage({ id: 'pages.common.edit' })}
    </Button>
  );
}

export function IDPDeleteButton(props: { id: number, onSuccess?: () => void }) {
  const intl = useIntl();
  const { id, onSuccess } = props;
  const { successAlert } = useModel('alert');
  const onDelete = () => {
    Modal.confirm({
      title: intl.formatMessage({ id: 'pages.common.delete' }),
      content: intl.formatMessage({ id: 'pages.idps.delete.warning' }),
      onOk: () => {
        deleteIDP(id)
          .then(() => {
            successAlert(intl.formatMessage({ id: 'pages.common.delete.success' }));
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
      {intl.formatMessage({ id: 'pages.common.delete' })}
    </Button>
  );
}

IDPDeleteButton.defaultProps = {
  onSuccess: () => {},
};

export function IDPNewButton() {
  const intl = useIntl();
  return (
    <Button
      type="primary"
      onClick={
                () => {
                  history.push('/admin/idps/new');
                }
              }
    >
      {intl.formatMessage({ id: 'pages.idps.new' })}
    </Button>
  );
}
