import {CloseOutlined, CopyOutlined, FullscreenExitOutlined, FullscreenOutlined} from '@ant-design/icons';
import {Button, Modal, notification} from 'antd';
import './index.less'
import styles from './index.less'
import {useState} from "react";
import copy from 'copy-to-clipboard'


interface Props {
  title: string
  visible: boolean
  fullscreen: boolean
  allowToggle: boolean
  onClose: () => void
  children?: any
}

export default (props: Props) => {
  const [fullscreen, setFullscreen] = useState(props.fullscreen)
  const onToggleClick = () => {
    setFullscreen(!fullscreen)
  }
  const onCopyClick = () => {
    if (copy(props.children.props.content)) {
      notification.success({message: "复制成功"})
    } else {
      notification.success({message: "复制失败"})
    }
  }

  return <Modal
    keyboard={true}
    footer={[]}
    closable={false}
    visible={props.visible}
    destroyOnClose={true}
    wrapClassName={fullscreen ? 'full-screen' : 'common-modal'}
    title={<div style={{display: 'flex', alignItems: 'center'}}>{props.title}
      <div style={{flex: 1}}/>
      <Button className={styles.buttonClass} onClick={onCopyClick}>
        <CopyOutlined className={fullscreen ? styles.iconFullScreen : styles.iconCommonModal}/>
      </Button>
      <Button hidden={!props.allowToggle} className={styles.buttonClass}>
        {
          fullscreen ?
            <FullscreenExitOutlined onClick={onToggleClick}
                                    className={fullscreen ? styles.iconFullScreen : styles.iconCommonModal}/> :
            <FullscreenOutlined onClick={onToggleClick}
                                className={fullscreen ? styles.iconFullScreen : styles.iconCommonModal}/>
        }
      </Button>
      <Button className={styles.buttonClass}>
        <CloseOutlined onClick={props.onClose} className={fullscreen ? styles.iconFullScreen : styles.iconCommonModal}/>
      </Button>
    </div>}
  >
    {props.children}
  </Modal>
}
