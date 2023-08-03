import { useCallback, useState } from 'react';

export function useReload(key: string): [string, () => void] {
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);
  return [`${key}-${reloadKey}`, reload];
}
