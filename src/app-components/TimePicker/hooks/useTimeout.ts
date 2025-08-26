import { useCallback, useRef } from 'react';

export function useTimeout(callback: () => void, delayMs: number) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clear();
    timeoutRef.current = setTimeout(callback, delayMs);
  }, [callback, clear, delayMs]);

  return { start, clear };
}
