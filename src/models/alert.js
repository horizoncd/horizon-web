import { useState, useCallback } from 'react';

export default function useAlertModel() {
  const [alert, setAlert] = useState({
    type: 'success',
    message: '',
    background: 'forestgreen',
  });

  const successAlert = useCallback((message) => {
    setAlert({type: 'success', message, background: 'forestgreen'})
  }, [])

  const errorAlert = useCallback((message) => {
    setAlert({type: 'error', message, background: '#ff4d4f'})
  }, [])

  const clearAlert = useCallback(() => {
    setAlert({type: '', message: '', background: ''})
  }, [])

  return {
    alert,
    successAlert,
    errorAlert,
    clearAlert
  };
}
