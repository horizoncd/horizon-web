import { PropsWithChildren } from 'react';
import WithTheme from '@/theme';

export default function PageWithTheme<Props>(
  WrappedComponent: React.ComponentType<Props>,
) {
  return (props: PropsWithChildren<Props>) => (
    <WithTheme>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <WrappedComponent {...props} />
    </WithTheme>
  );
}
