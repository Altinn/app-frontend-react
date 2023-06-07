import { useEffect } from 'react';

import { useStateDeepEqual } from 'src/hooks/useStateDeepEqual';

/**
 * React hook that takes a value, but only updates the value after a delay. Multiple changes to the value within the
 * delay period will only result in a single update. Uses deep equality to compare values.
 */
export function useDebounceDeepEqual<T>(value: T, delay: number, onBeforeChange?: () => void): T {
  const [debouncedValue, setDebouncedValue] = useStateDeepEqual<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onBeforeChange) {
        onBeforeChange();
      }
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay, onBeforeChange, setDebouncedValue]);

  return debouncedValue;
}
