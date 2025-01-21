import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * This type contains what we store in localstorage at different keys.
 * Types need to be able to be used with JSON.stringify and JSON.parse.
 * Since this can potentially be stored in the browser for a long time
 * we should not make any breaking changes here between versions as this could lead to unexpected behavior.
 * Instead, make a new key and mark the old one with the type 'never'.
 */
type LocalStorageEntries = {
  visitedPages: string[];
  selectedLanguage: string | null;
};

/**
 * Use state synced with localstorage at a specific key. The scope determines whether it should be unique per instance, per task, per subform, etc.
 * TODO: Handle potential exceptions from JSON.parse
 */
export function useLocalStorageState<K extends keyof LocalStorageEntries, D extends T, T = LocalStorageEntries[K]>(
  [key, ...scope]: [K, ...string[]],
  defaultValue: D,
): [T, (newValue: T) => void] {
  const fullKey = getFullKey(key, scope);

  // Used to prevent unecessary state updates.
  const lastRawValue = useRef<string | null>();

  const [value, _setValue] = useState<T | null>(() => {
    const rawValue = window.localStorage.getItem(fullKey);
    lastRawValue.current = rawValue;
    return rawValue != null ? (JSON.parse(rawValue) as T) : null;
  });

  useEffect(() => {
    const rawValue = window.localStorage.getItem(fullKey);
    if (rawValue !== lastRawValue.current) {
      lastRawValue.current = rawValue;
      rawValue != null ? _setValue(JSON.parse(rawValue) as T) : _setValue(null);
    }

    const callback = ({ key, newValue }: StorageEvent) => {
      if (key === fullKey && newValue !== lastRawValue.current) {
        lastRawValue.current = newValue;
        newValue != null ? _setValue(JSON.parse(newValue) as T) : _setValue(null);
      }
    };

    window.addEventListener('storage', callback);
    return () => window.removeEventListener('storage', callback);
  }, [fullKey]);

  const setValue = useCallback(
    (newValue: T) => {
      const rawValue = JSON.stringify(newValue);
      window.localStorage.setItem(fullKey, rawValue);
      // storage event only fires when modified in a different browsing context (another tab for example),
      // so it needs to be set to the state directly as well.
      _setValue(newValue);
    },
    [fullKey],
  );

  return [value ?? defaultValue, setValue];
}

function getFullKey(key: string, scope: string[]) {
  let fullKey = `${window.org}/${window.app}`;
  scope.length && (fullKey += `/${scope.join('/')}`);
  fullKey += `/${key}`;
  return fullKey;
}
