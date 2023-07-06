import { PropsWithChildren } from 'react';

function CountCircle(props: PropsWithChildren<{ count: number }>) {
  const { count } = props;
  return (
    <span
      style={{
        borderRadius: '50%',
        backgroundColor: '#f0f0f0',
        marginLeft: '2px',
        padding: '0 5px',
        borderWidth: '1px',
      }}
    >
      {count}
    </span>
  );
}

export default CountCircle;
