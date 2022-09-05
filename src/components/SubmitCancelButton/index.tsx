import { Button } from 'antd';

export default (props: { onSubmit: any, onCancel?: any, loading: boolean }) => (
  <div>
    <Button type="primary" onClick={props.onSubmit} loading={props.loading}>
      提交
    </Button>
    {
      props.onCancel && (
        <Button style={{ float: 'right' }} onClick={props.onCancel}>
          取消
        </Button>
      )
    }
  </div>
);
