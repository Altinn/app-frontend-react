import * as React from 'react';
import type { IComponentProps } from 'src/components';

let mockDelay: number | undefined = undefined;

export const mockDelayBeforeSaving = (newDelay: number) => {
  mockDelay = newDelay;
};

export interface DelayedSavedStateRetVal {
  value: string;
  setValue: (newValue: string, saveImmediately?: boolean) => void;
  saveValue: () => void;
  onPaste: () => void;
}

export function useDelayedSavedState(
  handleDataChange: IComponentProps['handleDataChange'],
  formValue?: string,
  saveAfter?: number | boolean,
): DelayedSavedStateRetVal {
  const [immediateState, setImmediateState] = React.useState(formValue);
  const [saveNextChangeImmediately, setSaveNextChangeImmediately] =
    React.useState(false);

  React.useEffect(() => {
    setImmediateState(formValue);
  }, [formValue]);

  React.useEffect(() => {
    if (typeof saveAfter === 'boolean' && !saveAfter) {
      return;
    }

    const timeout =
      mockDelay ||
      ((typeof saveAfter === 'number' ? saveAfter : 400) as number);
    const timeoutId = setTimeout(() => {
      if (immediateState !== formValue) {
        handleDataChange(immediateState, undefined, false, false);
      }
    }, timeout);

    return () => clearTimeout(timeoutId);
  }, [immediateState, handleDataChange, formValue, saveAfter]);

  return {
    value: immediateState,
    setValue: (newValue, saveImmediately) => {
      setImmediateState(newValue);
      if (newValue !== formValue) {
        if (saveImmediately) {
          handleDataChange(newValue, undefined, false, false);
        } else if (saveNextChangeImmediately) {
          // Save immediately on the next change event after a paste
          handleDataChange(newValue, undefined, false, false);
          setSaveNextChangeImmediately(false);
        }
      }
    },
    saveValue: () => {
      if (immediateState !== formValue) {
        handleDataChange(immediateState, undefined, false, false);
      }
    },
    onPaste: () => {
      setSaveNextChangeImmediately(true);
    },
  };
}
