import * as React from 'react';
import type { IComponentProps } from 'src/components';

let mockDelay: number | undefined = undefined;

export const mockDelayBeforeSaving = (newDelay: number) => {
  mockDelay = newDelay;
};

const getDelayBeforeSaving = () => mockDelay || 500;

export interface DelayedSavedStateRetVal {
  value: string;
  setValue: (newValue: string, saveImmediately?: boolean) => void;
  saveValue: () => void;
}

export function useDelayedSavedState(
  handleDataChange: IComponentProps['handleDataChange'],
  formValue?: string,
): DelayedSavedStateRetVal {
  const [immediateState, setImmediateState] = React.useState(formValue);

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
      if (saveImmediately && newValue !== formValue) {
        handleDataChange(newValue, undefined, false, false);
      }
    },
    saveValue: () => {
      if (immediateState !== formValue) {
        handleDataChange(immediateState, undefined, false, false);
      }
    },
  };
}
