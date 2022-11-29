import React, { ChangeEvent, ChangeEventHandler, EventHandler } from 'react';

function withTrim<Props extends { onChange?: ChangeEventHandler<HTMLInputElement>, placeholder?: string }>(
  WrappedComponent: React.ComponentType<Props>,
) {
  return function Inner(props: Props) {
    const { onChange: originOnChange } = props;

    const onChange: EventHandler<ChangeEvent<HTMLInputElement>> = (e) => {
      const t = e.target! as { value: string };
      t.value = t.value.trim();
      if (originOnChange) originOnChange(e);
    };

    const newPorps = {
      ...props, onChange,
    };

    /* eslint-disable react/jsx-props-no-spreading */ //@ts-ignore
    return <WrappedComponent {...newPorps} />;
  };
}

export default withTrim;
