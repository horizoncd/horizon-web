import { ComponentType, PropsWithChildren } from 'react';
import React from 'react';
import HorizonBreadcrumb from '../PageWithBreadcrumb';

function PageWithBreadcrumb<Props>(
  WrappedComponent: ComponentType<Props>,
): React.FC<Props> {
  return (props: PropsWithChildren<Props>) => (
    <HorizonBreadcrumb>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <WrappedComponent {...props} />
    </HorizonBreadcrumb>
  );
}

export default PageWithBreadcrumb;
