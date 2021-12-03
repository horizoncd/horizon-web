import {Button} from "antd";
import styles from './index.less'

export default (props: { onSubmit: any, onCancel?: any, loading: boolean }) => {
  return <div className={styles.formActions}>
    <Button type="primary" onClick={props.onSubmit} loading={props.loading}>
      提交
    </Button>
    {
      props.onCancel && (
        <Button style={{float: "right"}} onClick={props.onCancel}>
          取消
        </Button>
      )
    }
  </div>
}
