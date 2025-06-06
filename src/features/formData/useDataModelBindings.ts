import { useCallback, useMemo } from 'react';

import { FD } from 'src/features/formData/FormDataWrite';
import { DEFAULT_DEBOUNCE_TIMEOUT } from 'src/features/formData/types';
import { useMemoDeepEqual } from 'src/hooks/useStateDeepEqual';
import type { FDLeafValue } from 'src/features/formData/FormDataWrite';
import type { FDNewValue, FDSetValueResult } from 'src/features/formData/FormDataWriteStateMachine';
import type { IDataModelReference, SaveWhileTyping } from 'src/layout/common.generated';
import type { IDataModelBindings } from 'src/layout/layout';

// Describes how you want the data to be returned from the useDataModelBindings hook. Usually, if you're
// sending the data to a form input, it will expect a string. If you're sending raw data to an input, you'll
// confuse it if it gets a 'undefined' then a string later, as it uses the input to decide whether to be controlled
// or uncontrolled. However, if you're sending the data to a custom component that you know can handle undefined,
// null, string, number, arrays, objects etc, you can set this to 'raw' and get the data as it is in the data model.
type DataAs = 'raw' | 'string';

type DataType<DA extends DataAs> = DA extends 'raw' ? unknown : string;
interface Output<B extends IDataModelBindings | undefined, DA extends DataAs> extends SaveOutput<B> {
  formData: B extends undefined ? Record<string, never> : { [key in keyof B]: DataType<DA> };
  isValid: { [key in keyof B]: boolean };
}

interface SaveOutput<B extends IDataModelBindings | undefined> {
  setValue: (
    key: keyof Exclude<B, undefined>,
    value: FDLeafValue,
    callback?: (result: FDSetValueResult) => void,
  ) => void;
  setValues: (values: Partial<{ [key in keyof B]: FDLeafValue }>) => void;
}

type SaveOptions = Omit<FDNewValue, 'reference' | 'newValue' | 'schema'>;

const defaultBindings = {};

/**
 * This hook is to be used in a form component, and will provide you all the tools you need to get and set form data
 * from/into the data model. By default, it will convert values to strings for you, and convert them back into the
 * correct data type needed for the data model schema when saving values.
 */
export function useDataModelBindings<B extends IDataModelBindings | undefined, DA extends DataAs = 'string'>(
  _bindings: B,
  debounceTimeout: SaveWhileTyping = DEFAULT_DEBOUNCE_TIMEOUT,
  dataAs: DA = 'string' as DA,
): Output<B, DA> {
  const bindings = useMemoDeepEqual(() => (_bindings || defaultBindings) as Exclude<B, undefined>, [_bindings]);

  const formData = FD.useFreshBindings(bindings, dataAs);
  const isValid = FD.useBindingsAreValid(bindings);
  const { setValue, setValues } = useSaveDataModelBindings(bindings, debounceTimeout);

  return useMemo(
    () => ({ formData: formData as Output<B, DA>['formData'], setValue, setValues, isValid }),
    [formData, isValid, setValue, setValues],
  );
}

export function useSaveDataModelBindings<B extends IDataModelBindings | undefined>(
  _bindings: B,
  debounceTimeout: SaveWhileTyping = DEFAULT_DEBOUNCE_TIMEOUT,
): SaveOutput<B> {
  const bindings = useMemoDeepEqual(() => (_bindings || defaultBindings) as Exclude<B, undefined>, [_bindings]);

  const setLeafValue = FD.useSetLeafValue();
  const setMultiLeafValue = FD.useSetMultiLeafValues();

  const saveOptions: SaveOptions = useMemo(
    () =>
      debounceTimeout === DEFAULT_DEBOUNCE_TIMEOUT ||
      debounceTimeout === undefined ||
      typeof debounceTimeout === 'boolean'
        ? {}
        : { debounceTimeout },
    [debounceTimeout],
  );

  const setValue = useCallback(
    (key: keyof B, newValue: FDLeafValue, callback?: (result: FDSetValueResult) => void) =>
      setLeafValue({
        reference: bindings[key] as IDataModelReference,
        newValue,
        callback,
        ...saveOptions,
      }),
    [bindings, saveOptions, setLeafValue],
  );

  const setValues = useCallback(
    (values: Partial<{ [key in keyof B]: FDLeafValue }>) => {
      const newValues: FDNewValue[] = [];
      Object.entries(values).forEach(([key, value]) => {
        newValues.push({
          reference: bindings[key as keyof B] as IDataModelReference,
          newValue: value as FDLeafValue,
        });
      });
      setMultiLeafValue({
        changes: newValues,
        ...saveOptions,
      });
    },
    [bindings, saveOptions, setMultiLeafValue],
  );

  return { setValue, setValues };
}
