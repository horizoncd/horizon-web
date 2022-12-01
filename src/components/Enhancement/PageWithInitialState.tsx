import { useModel } from 'umi';
import React from 'react';
import { NotFound } from '../State';
import { API } from '@/services/typings';

export interface PageWithInitialStateProps {
  initialState: API.InitialState,
}

export function PageWithInitialState<Props extends PageWithInitialStateProps>(
  WrappedComponent: React.ComponentType<Props>,
): React.FC<Omit<Props, 'initialState'>> {
  type InnerProps = Omit<Props, 'initialState'>;
  return function WithInitialPage(props: InnerProps): React.ReactElement {
    const { initialState, loading } = useModel('@@initialState');
    if (loading || !initialState) {
      return <NotFound />;
    }

    const unionProps = {
      initialState, ...props,
    } as Props;

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <WrappedComponent {...unionProps} />;
  };
}
