import type { IComponentProps } from 'src/layout';

export interface DelayedSavedStateRetVal {
  value: string | undefined;
  setValue: (newValue: string | undefined, saveImmediately?: boolean, skipValidation?: boolean) => void;
  saveValue: () => void;
  onPaste: () => void;
}

/**
 * TODO: Remove
 * @deprecated
 */
export function useDelayedSavedState(
  handleDataChange: IComponentProps['handleDataChange'],
  formValue?: string,
  _saveAfter?: number | boolean,
): DelayedSavedStateRetVal {
  return {
    value: formValue,
    setValue: (newValue, _saveImmediately = false, skipValidation = false): void => {
      handleDataChange(newValue, { validate: !skipValidation });
    },
    saveValue: (): void => {
      // Do nothing, we always save immediately
    },
    onPaste: (): void => {
      // Do nothing, we always save immediately
    },
  };
}
