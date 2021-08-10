import { useState, useCallback } from 'react';
import { queryGroups } from '@/services/dashboard/groups';

export default function useAuthModel() {
  const [groups, setGroups] = useState([]);

  const queryGroup = useCallback(() => {
    queryGroups().then(({ data }) => {
      setGroups(data);
    });
  }, []);

  return {
    groups,
    queryGroup,
  };
}
