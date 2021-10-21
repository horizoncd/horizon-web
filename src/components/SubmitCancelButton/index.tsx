import {Button} from "antd";
import styles from './index.less'

export default (props: { onSubmit: any, onCancel?: any }) => {
  return <div className={styles.formActions}>
    <Button type="primary" onClick={props.onSubmit}>
      Submit
    </Button>
    {
      props.onCancel && (
        <Button style={{float: "right"}} onClick={props.onCancel}>
          Cancel
        </Button>
      )
    }
  </div>
}
