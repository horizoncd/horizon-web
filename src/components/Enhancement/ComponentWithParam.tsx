import React, { PropsWithChildren } from 'react';
import { useParams } from 'umi';

export interface ComponentWithParamIDProps {
  pathID: number,
}

// Components could use this HOC, whose path with param 'id' or 'name' and has Props named 'pathID' or 'pathName'
export function ComponentWithParamID<Props extends ComponentWithParamIDProps>(WrappedComponent: React.ComponentType<Props>) {
  return function NewComponent(props: PropsWithChildren<Omit<Props, keyof ComponentWithParamIDProps>>): React.ReactElement {
    const param = useParams<{ id: string }>();
    const newProps = { pathID: 0, ...props } as Props;
    newProps.pathID = Number.parseInt(param.id, 10);

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <WrappedComponent {...newProps} />;
  };
}
