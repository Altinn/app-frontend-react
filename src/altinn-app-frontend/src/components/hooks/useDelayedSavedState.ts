import * as React from 'react';
import { IComponentProps } from "src/components";

export function useDelayedSavedState(
  handleDataChange:IComponentProps['handleDataChange'],
  initialValue?:string,
  delayMsBeforeSaving=500
):[string, (newValue:string)=>void] {
  const [immediateState, setImmediateState] = React.useState(initialValue);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (immediateState !== initialValue) {
        handleDataChange(immediateState);
      }
    }, delayMsBeforeSaving);
    return () => clearTimeout(timeoutId);
  }, [immediateState]);

  return [immediateState, setImmediateState];
}
