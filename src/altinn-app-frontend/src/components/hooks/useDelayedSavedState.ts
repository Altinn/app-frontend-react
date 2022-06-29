import * as React from "react";
import type { IComponentProps } from "src/components";

export function useDelayedSavedState(
  handleDataChange: IComponentProps["handleDataChange"],
  formValue?: string,
  delayMsBeforeSaving = 500
): [string, (newValue: string) => void] {
  const [immediateState, setImmediateState] = React.useState(formValue);

  React.useEffect(() => {
    setImmediateState(formValue);
  }, [formValue]);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (immediateState !== formValue) {
        handleDataChange(immediateState, undefined, false, false);
      }
    }, delayMsBeforeSaving);
    return () => clearTimeout(timeoutId);
  }, [immediateState]);

  return [immediateState, setImmediateState];
}
