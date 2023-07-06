import { useCallback, useState } from 'react';

function useRefCallback() {
  const [ready, setReady] = useState();
  const refCallback = useCallback((node) => {
    if (node) {
      setReady(node);
    }
  }, []);

  return [ready, refCallback];
}

export default useRefCallback;
