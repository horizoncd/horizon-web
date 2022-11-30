import { Tooltip } from 'antd';
import utils from '@/utils';

function PopupTime(props: { time: string, prefix?: string }) {
  const { prefix, time } = props;

  return (
    prefix ? (
      <Tooltip title={utils.timeToLocal(time)}>
        {prefix}
        {' '}
        {utils.timeFromNow(time)}
      </Tooltip>
    ) : (
      <Tooltip title={utils.timeToLocal(time)}>
        {utils.timeFromNow(time)}
      </Tooltip>
    )
  );
}

PopupTime.defaultProps = {
  prefix: '',
};

export default PopupTime;
