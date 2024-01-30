import { CSSProperties } from 'react';
import { Tooltip } from 'antd';
import utils from '@/utils';

interface PopupTimeProps {
  time: string;
  prefix?: string;
  style?: CSSProperties;
}

function PopupTime(props: PopupTimeProps) {
  const { prefix, time, style = {} } = props;

  return (
    prefix ? (
      <Tooltip title={utils.timeToLocal(time)}>
        <span style={style}>
          {prefix}
          {' '}
          {utils.timeFromNow(time)}
        </span>
      </Tooltip>
    ) : (
      <Tooltip title={utils.timeToLocal(time)}>
        <span style={style}>
          {utils.timeFromNow(time)}
        </span>
      </Tooltip>
    )
  );
}

PopupTime.defaultProps = {
  prefix: '',
};

export default PopupTime;
