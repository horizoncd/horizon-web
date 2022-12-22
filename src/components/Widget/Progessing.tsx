import { useState } from 'react';
import { useRequest } from 'umi';

interface ProgressingProps {
  title: string,
  maxCount?: number,
  style: any,
}

function Progressing({ title, maxCount = 3, style }: ProgressingProps) {
  // eslint-disable-next-line no-param-reassign
  if (maxCount < 2) maxCount = 2;
  const [count, setCount] = useState<number>(0);

  useRequest<{ data: number }>(
    async () => { setCount((count + 1) % (maxCount + 1)); return { data: count }; },
    {
      pollingInterval: 1000,
    },
  );

  return (
    <span
      style={{
        color: 'red',
        width: '70px',
        ...style,
      }}
    >
      {title}
      {' '}
      {new Array(count).fill('.')}
    </span>
  );
}

Progressing.defaultProps = {
  maxCount: 3,
};

export default Progressing;
