import { Tooltip } from 'antd';
import utils from '@/utils';

function PopupTime(props: { time: string, prefix?: string }) {
  const { prefix, time } = props;

  return (
    <Tooltip title={utils.timeToLocal(time)}>
      {prefix}
      {utils.timeFromNowEnUS(time)}
    </Tooltip>
  );
}

PopupTime.defaultProps = {
  prefix: '',
};

export default PopupTime;
