import * as React from 'react';
import type { IComponentProps } from 'src/components';

let mockDelay: number | undefined = undefined;

export const mockDelayBeforeSaving = (newDelay: number) => {
  mockDelay = newDelay;
};

const getDelayBeforeSaving = () => mockDelay || 400;

export interface DelayedSavedStateRetVal {
  value: string;
  setValue: (newValue: string, saveImmediately?: boolean) => void;
  saveValue: () => void;
  onPaste: () => void;
}

export function useDelayedSavedState(
  handleDataChange: IComponentProps['handleDataChange'],
  formValue?: string,
): DelayedSavedStateRetVal {
  const [immediateState, setImmediateState] = React.useState(formValue);
  const [saveNextChangeImmediately, setSaveNextChangeImmediately] =
    React.useState(false);

  React.useEffect(() => {
    setImmediateState(formValue);
  }, [formValue]);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (immediateState !== formValue) {
        handleDataChange(immediateState, undefined, false, false);
      }
    }, getDelayBeforeSaving());
    return () => clearTimeout(timeoutId);
  }, [immediateState, handleDataChange, formValue]);

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
