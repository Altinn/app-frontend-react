import * as React from "react";
import type { IComponentProps } from "src/components";

let mockDelay: number | undefined = undefined;

export const mockDelayBeforeSaving = (newDelay: number) => {
  mockDelay = newDelay;
};

const getDelayBeforeSaving = () => mockDelay || 500;

export function useDelayedSavedState(
  handleDataChange: IComponentProps["handleDataChange"],
  formValue?: string
): [string, (newValue: string, saveImmediately?: boolean) => void] {
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
  }, [immediateState, handleDataChange]);

  return [
    immediateState,
    (newValue, saveImmediately) => {
      setImmediateState(newValue);
      if (saveImmediately && newValue !== formValue) {
        handleDataChange(newValue, undefined, false, false);
      }
    },
  ];
}
