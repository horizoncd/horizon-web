import {
  CloseOutlined, CopyOutlined, FullscreenExitOutlined, FullscreenOutlined,
} from '@ant-design/icons';
import {
  Button, Modal, Select, Switch,
} from 'antd';
import React, { useState } from 'react';
import copy from 'copy-to-clipboard';
import { useIntl } from '@@/plugin-locale/localeExports';
import { useModel } from '@@/plugin-model/useModel';
import styles from './index.less';
import './index.less';

const { Option } = Select;

interface Props {
  title: string
  visible: boolean
  fullscreen: boolean
  supportFullscreenToggle: boolean
  onClose: () => void
  listToSelect?: string[]
  onSelectChange?: (item: any) => void
  children?: any
  supportRefresh?: boolean
  onRefreshButtonToggle?: (checked: boolean, event: MouseEvent) => void
}

export default (props: Props) => {
  const intl = useIntl();
  const [fullscreen, setFullscreen] = useState(props.fullscreen);
  const { successAlert, errorAlert } = useModel('alert');
  const onToggleClick = () => {
    setFullscreen(!fullscreen);
  };
  const onCopyClick = () => {
    if (copy(props.children.props.content)) {
      successAlert(intl.formatMessage({ id: 'component.FullscreenModal.copySuccess' }));
    } else {
      errorAlert(intl.formatMessage({ id: 'component.FullscreenModal.copyFailed' }));
    }
  };

  return (
    <Modal
      keyboard
      footer={[]}
      closable={false}
      visible={props.visible}
      destroyOnClose
      wrapClassName={fullscreen ? 'full-screen' : 'common-modal'}
      title={(
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {props.title}
          <div style={{ flex: 1 }} />
          {props.supportRefresh && (
          <span
            style={{ fontSize: '13px', fontWeight: 'bold' }}
          >
            {intl.formatMessage({ id: 'component.FullscreenModal.autoRefresh' })}
          </span>
          )}
          {props.supportRefresh && (
          <Switch
            className={styles.buttonClass}
            size="small"
            defaultChecked
            onChange={props.onRefreshButtonToggle}
          />
          )}
          {
        (props.listToSelect && props.onSelectChange) && (
        <div>
          <Select
            defaultValue={props.listToSelect[0]}
            onChange={(value) => {
              props.onSelectChange!(value);
            }}
          >
            {
              props.listToSelect?.map((item: string) => <Option key={item} value={item}>{item}</Option>)
            }
          </Select>
        </div>
        )
      }
          <Button className={styles.buttonClass} onClick={onCopyClick}>
            <CopyOutlined className={styles.iconCommonModal} />
          </Button>
          <Button hidden={!props.supportFullscreenToggle} className={styles.buttonClass}>
            {
          fullscreen
            ? (
              <FullscreenExitOutlined
                onClick={onToggleClick}
                className={styles.iconCommonModal}
              />
            )
            : (
              <FullscreenOutlined
                onClick={onToggleClick}
                className={styles.iconCommonModal}
              />
            )
        }
          </Button>
          <Button className={styles.buttonClass}>
            <CloseOutlined onClick={props.onClose} className={fullscreen ? styles.iconFullScreen : styles.iconCommonModal} />
          </Button>
        </div>
)}
    >
      {props.children}
    </Modal>
  );
};
