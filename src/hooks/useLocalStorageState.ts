import { useRef, useSyncExternalStore } from 'react';

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
 * TODO: Handle potential exceptions from JSON.parse
 */
class LocalStorageController<T> {
  private key: string;
  private defaultValue: T;

  private currentValue: T | null = null;
  private currentRawValue: string | null = null;
  private triggerRender: (() => void) | null = null;

  public setDeps(key: string, defaultValue: T) {
    this.key = key;
    this.defaultValue = defaultValue;
  }

  public getSnapshot = () => {
    this.updateCurrentValue(window.localStorage.getItem(this.key));
    return this.currentRawValue != null ? (this.currentValue as T) : this.defaultValue;
  };

  public subscribe = (triggerRerender: () => void) => {
    this.triggerRender = triggerRerender;

    const callback = ({ key, newValue }: StorageEvent) => {
      if (key === this.key && this.updateCurrentValue(newValue)) {
        this.triggerRender?.();
      }
    };

    /**
     * 'storage' event only gets called when localstorage is modified from a different browser context (e.g. a different tab),
     * so using a custom 'internal-storage' event to keep hooks in sync internally
     */
    window.addEventListener('storage', callback);
    window.addEventListener('internal-storage', callback);
    return () => {
      window.removeEventListener('storage', callback);
      window.removeEventListener('internal-storage', callback);
    };
  };

  public setValue = (valueOrSetter: T | ((prev: T) => T)) => {
    const prev = this.currentRawValue !== null ? (this.currentValue as T) : this.defaultValue;
    const newValue = typeof valueOrSetter === 'function' ? (valueOrSetter as (prev: T) => T)(prev) : valueOrSetter;
    const newRawValue = JSON.stringify(newValue);
    window.localStorage.setItem(this.key, newRawValue);
    window.dispatchEvent(new StorageEvent('internal-storage', { newValue: newRawValue, key: this.key }));
  };

  private updateCurrentValue(newRawValue: string | null): boolean {
    if (newRawValue !== this.currentRawValue) {
      this.currentRawValue = newRawValue;
      this.currentValue = newRawValue != null ? (JSON.parse(newRawValue) as T) : null;
      return true;
    }
    return false;
  }
}

type ScopeKey = string | number | boolean | null | undefined;

/**
 * Use state synced with localstorage at a specific key. The scope keys determines whether it should be unique per instance, per task, per subform, etc.
 */
export function useLocalStorageState<K extends keyof LocalStorageEntries, D extends T, T = LocalStorageEntries[K]>(
  [entryKey, ...scopeKeys]: [K, ...ScopeKey[]],
  defaultValue: D,
): [T, (valueOrSetter: T | ((prev: T) => T)) => void] {
  const key = getFullKey(entryKey, scopeKeys);

  const state = useRef<LocalStorageController<T>>();
  if (!state.current) {
    state.current = new LocalStorageController<T>();
  }

  state.current.setDeps(key, defaultValue);

  const value = useSyncExternalStore(state.current.subscribe, state.current.getSnapshot);

  return [value, state.current.setValue];
}

function isNotNullUndefinedOrEmpty(key: ScopeKey) {
  return key != null && (typeof key !== 'string' || !!key.length);
}

function getFullKey(entryKey: string, scopeKeys: ScopeKey[]) {
  let fullKey = `${window.org}/${window.app}`;

  scopeKeys.length && (fullKey += `/${scopeKeys.filter(isNotNullUndefinedOrEmpty).join('/')}`);
  fullKey += `/${entryKey}`;
  return fullKey;
}
