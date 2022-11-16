import { Spin } from 'antd';
import LocationBox from './LocationBox';

function CenterSpin() {
  return (
    <LocationBox vertical="center" horizontal="center">
      <Spin />
    </LocationBox>
  );
}

export default CenterSpin;
