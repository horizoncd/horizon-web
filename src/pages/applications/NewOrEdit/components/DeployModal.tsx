/* eslint-disable import/prefer-default-export */
import { Modal } from 'antd';

export const ModalInfo = (args : { onOk: ()=>void, onCancel: ()=> void, intl: any }) => {
  const { onOk, onCancel, intl } = args;
  Modal.info({
    title: intl.formatMessage({ id: 'pages.applicationNew.deployConfirm.title' }),
    content: intl.formatMessage({ id: 'pages.applicationNew.deployConfirm.content' }),
    onOk,
    onCancel,
    okCancel: true,
  });
};
