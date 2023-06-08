import { useEffect, useState } from 'react';

import deepEqual from 'fast-deep-equal';

/**
 * Declared objects gets new memory references for every render, so we can't rely on simple equality checks (the way
 * we can with primitives). This hook will do a deep equality check, and only update the state if the new value is
 * different from the old value.
 */
export function useMemoDeepEqual<T>(value: T): T {
  const [state, setState] = useState(value);

  useEffect(() => {
    if (!deepEqual(state, value)) {
      setState(value);
    }
  }, [value, state]);

  return state;
}
