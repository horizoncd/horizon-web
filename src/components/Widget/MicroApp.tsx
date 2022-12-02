import { PropsWithChildren, useState } from 'react';
import { MicroApp as UmiMicroApp } from 'umi';
import { Props as MicroAppProps } from '../../.umi/plugin-qiankun/MicroApp';
import { qiankun } from '@/app';

function WithCheck<Props extends MicroAppProps>(WrappedComponent: React.ComponentType<Props>): React.FC<Props> {
  return function Inner(props: PropsWithChildren<Props>): React.ReactElement {
    const { name } = props;
    const [ifRender, setIfRender] = useState(false);
    qiankun.then(({ apps }) => {
      apps.forEach((app: SYSTEM.MicroApp) => {
        if (app.name === name) {
          setIfRender(true);
          return false;
        }
        return true;
      });
    });
    return ifRender ? (
      <div style={{ display: 'inline-block' }}>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <WrappedComponent {...props} />
        {' '}
      </div>
    ) : <div />;
  };
}

export default WithCheck(UmiMicroApp);
