import type { IFormData } from 'src/features/formData';
import type { IDataModelBindings } from 'src/layout/layout';

interface IFormDataMethods {
  setLeafValue: (path: string, newValue: any) => void;
}

export type FDValue = string | number | boolean | object | undefined | null | FDValue[];
export type FDFreshness = 'current' | 'debounced';

interface IFormDataFunctionality {
  /**
   * This will return the form data as a dot map, where the keys are dot-separated paths. This is the same format
   * as the older form data. Consider using any of the newer methods instead, which may come with performance benefits.
   */
  useAsDotMap: (freshness?: FDFreshness) => IFormData;

  /**
   * This will return the form data as a deep object, just like the server sends it to us (and the way we send it back).
   */
  useAsObject: (freshness?: FDFreshness) => object;

  /**
   * This returns a value, as picked from the form data. The value may be anything that is possible to store in the
   * data model (scalar values, arrays and objects). If the value is not found, undefined is returned. Null may
   * also be returned if the value is explicitly set to null.
   */
  usePick: (path: string | undefined, freshness?: FDFreshness) => FDValue;

  /**
   * This returns multiple values, as picked from the form data. The values in the input object is expected to be
   * dot-separated paths, and the return value will be an object with the same keys, but with the values picked
   * from the form data. If a value is not found, undefined is returned. Null may also be returned if the value
   * is explicitly set to null.
   */
  useBindings: <T extends IDataModelBindings | undefined>(
    bindings: T,
    freshness?: FDFreshness,
  ) => T extends undefined ? Record<string, never> : { [key in keyof T]: FDValue };

  /**
   * These methods can be used to update the data model.
   */
  useMethods: () => IFormDataMethods;
}
