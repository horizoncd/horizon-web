import { PageContainer } from '@ant-design/pro-layout';
import { PropsWithChildren } from 'react';

export default function PageWithTheme<Props>(
  WrappedComponent: React.ComponentType<Props>,
) {
  return (props: PropsWithChildren<Props>) => (
    <PageContainer title={false}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <WrappedComponent {...props} />
    </PageContainer>
  );
}
