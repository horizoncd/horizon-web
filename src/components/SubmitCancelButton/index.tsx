import { Button } from 'antd';
import Intl from '@/components/Intl';

export default function SubmitCancelButton(props: { onSubmit: any, onCancel?: any, loading: boolean }) {
  const { onSubmit, loading, onCancel } = props;
  return (
    <div>
      <Button type="primary" onClick={onSubmit} loading={loading}>
        <Intl id="pages.common.submit" />
      </Button>
      {
        onCancel && (
          <Button style={{ float: 'right' }} onClick={onCancel}>
            <Intl id="pages.common.cancel" />
          </Button>
        )
      }
    </div>
  );
}

SubmitCancelButton.defaultProps = {
  onCancel: () => {},
};
