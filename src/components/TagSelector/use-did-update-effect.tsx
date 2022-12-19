import React, { useEffect, useRef } from 'react';

function useDidUpdateEffect(fn: () => void, inputs: React.DependencyList) {
  const didMountRef = useRef(false);

  useEffect(() => {
    if (didMountRef.current) fn();
    else didMountRef.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...inputs, fn]);
}

export default useDidUpdateEffect;
