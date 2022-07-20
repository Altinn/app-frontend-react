import { useRef, useEffect } from 'react';
import type { TypedUseSelectorHook } from 'react-redux';
import { useSelector } from 'react-redux';
import type { RootState } from 'src/store';

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useHasChangedIgnoreUndefined = (val: any) => {
  const stringifiedVal = JSON.stringify(val);
  const prevVal = usePrevious(stringifiedVal);
  if (!val || !prevVal) {
    return false;
  }
  return prevVal !== stringifiedVal;
};

export const usePrevious = (value: any) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};
export { useAppDispatch } from './useAppDispatch';
export { useFormLayoutHistoryAndMatchInstanceLocation } from './useFormLayoutHistory';
