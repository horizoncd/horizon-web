import { useState, useCallback } from 'react';

export default () => {
  const [apps, setApps] = useState(new Map() as Map<string, SYSTEM.MicroApp>);

  const setMap = useCallback((items: SYSTEM.MicroApp[]) => {
    const m = new Map<string, SYSTEM.MicroApp>();
    items.forEach((app) => {
      m.set(app.name, app);
    });
    setApps(m);
  }, []);

  return { apps, setApps: setMap };
};
