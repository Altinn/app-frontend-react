import type { JSONSchema7 } from 'json-schema';

interface BaseError {
  isError: true;
  stoppedAtPointer: string;
  stoppedAtDotNotation: string;
}

interface ReferenceError extends BaseError {
  error: 'referenceError';
  reference: string;
}

interface MissingRepeatingGroup extends BaseError {
  error: 'missingRepeatingGroup';
}

interface MissingProperty extends BaseError {
  error: 'missingProperty';
  property: string;
  validProperties: string[];
}

interface MisCasedProperty extends BaseError {
  error: 'misCasedProperty';
  foundProperty: string;
}

interface NotAnArray extends BaseError {
  error: 'notAnArray';
  actualType?: string;
}

export type SchemaLookupError =
  | ReferenceError
  | MissingRepeatingGroup
  | MissingProperty
  | MisCasedProperty
  | NotAnArray;

export function isSchemaLookupError(error: JSONSchema7 | SchemaLookupError): error is SchemaLookupError {
  return error && 'isError' in error && error.isError;
}

export function isSchemaLookupSuccess(schema: JSONSchema7 | SchemaLookupError): schema is JSONSchema7 {
  return !!schema && typeof schema === 'object' && !isSchemaLookupError(schema);
}
