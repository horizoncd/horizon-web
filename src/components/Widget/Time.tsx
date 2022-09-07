import { Tooltip } from 'antd';
import utils from '@/utils';

function PopupTime(props: { time: string }) {
  const { time } = props;

  return (
    <Tooltip title={utils.timeToLocal(time)}>
      Updated
      {' '}
      {utils.timeFromNowEnUS(time)}
    </Tooltip>
  );
}

export default PopupTime;
