import { useEffect, useRef } from 'react';

import type { IOption } from 'src/layout/common.generated';

const usePrevious = (value: string[] | undefined) => {
  const ref = useRef<string[]>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};

export const useHasOptionsChanged = (options: IOption[] | undefined) => {
  const current = options?.map((option) => option.value);
  const previous = usePrevious(current);

  if (!current || !previous) {
    return false;
  }

  return toLocaleSortedString(current) !== toLocaleSortedString(previous);
};

function toLocaleSortedString(value: string[]) {
  return value
    .slice()
    .sort((a, b) => a.localeCompare(b))
    .join();
}
