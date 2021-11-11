import { useState, useCallback } from 'react';

export default function useAlertModel() {
  const [alert, setAlert] = useState({
    type: 'success',
    message: ''
  });

  const successAlert = useCallback((message) => {
    setAlert({type: 'success', message})
  }, [])

  const errorAlert = useCallback((message) => {
    setAlert({type: 'error', message})
  }, [])

  const clearAlert = useCallback(() => {
    setAlert({type: '', message: ''})
  }, [])

  return {
    alert,
    successAlert,
    errorAlert,
    clearAlert
  };
}
