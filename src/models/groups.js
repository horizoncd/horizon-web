import { useCallback, useState } from 'react';

const defaultGroups = [
];

export default function useAuthModel() {
  const [groups, setGroups] = useState(defaultGroups);

  const queryGroup = useCallback(() => {
    // queryGroups().then(({data}) => {
    //   setGroups(data);
    // });
  }, []);

  return {
    groups,
    queryGroup,
  };
}
