import { useCallback, useMemo, useState } from 'react';

import type { JSONSchema7 } from 'json-schema';

import { useBindingSchema } from 'src/features/datamodel/useBindingSchema';
import { FD } from 'src/features/formData/FormDataWrite';
import { DEFAULT_DEBOUNCE_TIMEOUT } from 'src/features/formData/types';
import { useMemoDeepEqual } from 'src/hooks/useStateDeepEqual';
import type { FDNewValue } from 'src/features/formData/FormDataWriteStateMachine';
import type { SaveWhileTyping } from 'src/layout/common.generated';
import type { IDataModelBindings } from 'src/layout/layout';

export interface DMBOptions {
  saveWhileTyping?: SaveWhileTyping;

  // Describes how you want the data to be returned from the useDataModelBindings hook. Usually, if you're
  // sending the data to a form input, it will expect a string. If you're sending raw data to an input, you'll
  // confuse it if it gets a 'undefined' then a string later, as it uses the input to decide whether to be controlled
  // or uncontrolled. However, if you're sending the data to a custom component that you know can handle undefined,
  // null, string, number, arrays, objects etc, you can set this to 'raw' and get the data as it is in the data model.
  dataAs?: 'raw' | 'string';
}

interface DefaultOptions extends DMBOptions {
  saveWhileTyping: number;
  dataAs: 'string';
}

const defaultOptions: Required<DefaultOptions> = {
  saveWhileTyping: DEFAULT_DEBOUNCE_TIMEOUT,
  dataAs: 'string',
};

type DataType<O extends DMBOptions> = O['dataAs'] extends 'raw' ? any : string;
interface Output<B extends IDataModelBindings | undefined, O extends DMBOptions> {
  // This contains your form data
  formData: B extends undefined ? Record<string, never> : { [key in keyof B]: DataType<O> };
  debounce: () => void;
  setValue: (key: keyof Exclude<B, undefined>, value: any) => void;
  setValues: (values: Partial<{ [key in keyof B]: any }>) => void;
  isValid: { [key in keyof B]: boolean };
}

const defaultBindings = {};

/**
 * This hook is to be used in a form component, and will provide you all the tools you need to get and set form data
 * from/into the data model. By default, it will convert values to strings for you, and convert them back into the
 * correct data type needed for the data model schema when saving values.
 */
export function useDataModelBindings<B extends IDataModelBindings | undefined, O extends DMBOptions = DefaultOptions>(
  _bindings: B,
  _options: O = defaultOptions as O,
): Output<B, O> {
  // The wrapper makes sure our hook is not called again repeatedly when the bindings object reference changes.
  const bindings = useMemoDeepEqual(() => _bindings || defaultBindings, [_bindings]);
  const options = useMemoDeepEqual(() => ({ ...defaultOptions, ..._options }) as Required<DMBOptions>, [_options]);
  return useInnerDataModelBindings(bindings, options) as Output<B, O>;
}

function useInnerDataModelBindings<B extends IDataModelBindings, O extends Required<DMBOptions>>(
  bindings: B,
  options: O,
): Output<B, O> {
  const { dataAs, saveWhileTyping } = options;
  const setLeafValue = FD.useSetLeafValue();
  const setMultiLeafValue = FD.useSetMultiLeafValues();
  const debounce = FD.useDebounceImmediately();
  const formData = FD.useFreshBindings(bindings, dataAs);
  const schemas = useBindingSchema(bindings);

  const saveOptions: Omit<FDNewValue, 'path' | 'newValue'> = useMemo(() => {
    if (saveWhileTyping === DEFAULT_DEBOUNCE_TIMEOUT) {
      return {};
    }
    return { debounceTimeout: saveWhileTyping };
  }, [saveWhileTyping]);

  // When the user is typing, for example a negative number, they will type the minus sign, and then the number. If we
  // try to save just the minus sign, that's not a valid number to store in the database, so we'll need to keep a
  // local copy of the stringy data until the value is valid, and then save it to the data model at that point.
  // By this definition, if we have local data, the data in the binding is not valid. To prevent us from saving invalid
  // or stale data in the data model, we'll clear the data from the data model as long as we have local (invalid) data.
  const [localData, setLocalData] = useState<Record<string, any>>({});

  const setValue = useCallback(
    (key: keyof B, value: any) => {
      const { newValue, error } = convertData(value, schemas?.[key] ?? undefined);
      if (error) {
        setLocalData((prev) => ({ ...prev, [key]: value }));
        setLeafValue({ path: bindings[key] as string, newValue: undefined });
      } else {
        setLeafValue({
          path: bindings[key] as string,
          newValue,
          ...saveOptions,
        });
        setLocalData((prev) => {
          if (!(key in prev)) {
            return prev;
          }
          const { [key]: _, ...rest } = prev;
          return rest;
        });
      }
    },
    [bindings, saveOptions, schemas, setLeafValue],
  );

  const setValues = useCallback(
    (values: Partial<B>) => {
      const newValues: FDNewValue[] = [];
      const newLocalData: any = {};
      const removeLocalData: string[] = [];
      Object.entries(values).forEach(([key, value]) => {
        const { newValue, error } = convertData(value, schemas?.[key as keyof B] ?? undefined);
        if (error) {
          newLocalData[key as keyof B] = value;
          newValues.push({ path: bindings[key as keyof B] as string, newValue: undefined });
        } else {
          newValues.push({
            path: bindings[key as keyof B] as string,
            newValue,
            ...saveOptions,
          });
          removeLocalData.push(key as string);
        }
      });
      setMultiLeafValue({
        changes: newValues,
        debounceTimeout: saveWhileTyping,
      });
      setLocalData((prev) => {
        const newData = { ...prev, ...newLocalData };
        removeLocalData.forEach((key) => {
          const { [key]: _, ...rest } = newData;
          newData[key] = rest;
        });
        return newData;
      });
    },
    [bindings, saveOptions, saveWhileTyping, schemas, setMultiLeafValue],
  );

  const isValid = useMemo(() => {
    const invalidKeys = Object.keys(localData);
    return Object.fromEntries(
      Object.entries(bindings).map(([key]) => {
        const invalid = invalidKeys.includes(key);
        return [key, !invalid];
      }),
    ) as { [key in keyof B]: boolean };
  }, [bindings, localData]);

  const combinedFormData = useMemo(
    () => ({ ...formData, ...localData }) as Output<B, O>['formData'],
    [formData, localData],
  );

  return { formData: combinedFormData, debounce, setValue, setValues, isValid };
}

function convertData(value: any, schema: JSONSchema7 | undefined): { newValue: any; error: boolean } {
  const sVal = String(value);
  if (!schema) {
    // Assume it's a string if we don't have a binding. This is not likely to happen as long as components aren't
    // even rendered when their data model bindings fail.
    return { newValue: sVal, error: false };
  }

  if (schema.type === 'string') {
    return { newValue: sVal, error: false };
  }

  if (schema.type === 'number' && canBeParsedToDecimal(sVal)) {
    const parsed = parseFloat(sVal);
    return isNaN(parsed) ? { newValue: undefined, error: true } : { newValue: parsed, error: false };
  } else if (schema.type === 'integer' && canBeParsedToInteger(sVal)) {
    const parsed = parseInt(sVal);
    return isNaN(parsed) ? { newValue: undefined, error: true } : { newValue: parsed, error: false };
  } else if (schema.type === 'boolean') {
    return sVal === 'true' || sVal === 'false'
      ? { newValue: sVal === 'true', error: false }
      : { newValue: undefined, error: true };
  }

  throw new Error(`Unsupported schema type: ${schema.type}`);
}

/**
 * Checks if a string can be parsed to a decimal in C#.
 * 1. Empty string is valid. This will get removed from the datamodel before save.
 * 2. Value must be parsable as float in javascript.
 * 3. Value must be between +- 7.9e28
 * @see https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/floating-point-numeric-types
 */
export function canBeParsedToDecimal(value: string): boolean {
  if (!value.length) {
    return true;
  }
  const parsedValue = parseFloat(value);
  return isFinite(parsedValue) && parsedValue < 7.92e28 && parsedValue > -7.92e28;
}

export function canBeParsedToInteger(value: string): boolean {
  if (!value.length) {
    return true;
  }
  if (!value.match(/^-?\d+$/)) {
    return false;
  }
  const parsedValue = parseInt(value);
  return isFinite(parsedValue) && parsedValue < 2147483647 && parsedValue > -2147483648;
}
