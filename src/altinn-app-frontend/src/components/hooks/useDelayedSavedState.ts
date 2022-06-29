import * as React from "react";
import type { IComponentProps } from "src/components";

export function useDelayedSavedState(
  handleDataChange: IComponentProps["handleDataChange"],
  formValue?: string,
  delayMsBeforeSaving = 500
): [string, (newValue: string, saveImmediately?: boolean) => void] {
  const [immediateState, setImmediateState] = React.useState(formValue);
  const [savedState, setSavedState] = React.useState(formValue);

  React.useEffect(() => {
    setImmediateState(formValue);
  }, [formValue]);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (immediateState !== savedState) {
        handleDataChange(immediateState, undefined, false, false);
        setSavedState(immediateState);
      }
    }, delayMsBeforeSaving);
    return () => clearTimeout(timeoutId);
  }, [immediateState, handleDataChange, delayMsBeforeSaving, savedState]);

  return [
    immediateState,
    (newValue, saveImmediately) => {
      setImmediateState(newValue);
      if (saveImmediately) {
        handleDataChange(newValue, undefined, false, false);
        setSavedState(newValue);
      }
    },
  ];
}
