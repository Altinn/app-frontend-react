import { useEffect, useState } from 'react';

import { useStateDeepEqual } from 'src/hooks/useStateDeepEqual';

/**
 * React hook that takes a value, but only updates the value after a delay. Multiple changes to the value within the
 * delay period will only result in a single update.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Same as the above, but compares the value with a deep equal function, so that objects that are equal but not
 * the same object will be considered equal.
 */
export function useDebounceDeepEqual<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useStateDeepEqual<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay, setDebouncedValue]);

  return debouncedValue;
}
