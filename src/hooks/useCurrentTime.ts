import { useState, useEffect } from 'react';

export function useCurrentTime(refreshIntervalMs = 60000) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, refreshIntervalMs);

    return () => clearInterval(timer);
  }, [refreshIntervalMs]);

  return now;
}
