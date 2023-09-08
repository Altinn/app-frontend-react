import pointer from 'json-pointer';
import type { JSONSchema7, JSONSchema7Definition } from 'json-schema';

import { pointerToDotNotation } from 'src/features/datamodel/notations';

interface Props {
  schema: JSONSchema7;
  bindingPointer: string;
  rootElementPath?: string;
}

interface Error {
  isError: true;
}

interface ErrorWithPath extends Error {
  stoppedAtPointer: string;
  stoppedAtDotNotation: string;
}

interface LocationNotFound extends ErrorWithPath {
  error: 'locationNotFound';
}

interface RanOutOfAlternatives extends ErrorWithPath {
  error: 'ranOutOfAlternatives';
  evaluatedAlternatives: number;
}

interface LookupFailed extends Error {
  error: 'lookupFailed';
}

interface ReferenceError extends ErrorWithPath {
  error: 'referenceError';
  reference: string;
}

interface MissingRepeatingGroup extends ErrorWithPath {
  error: 'missingRepeatingGroup';
}

interface MissingProperty extends ErrorWithPath {
  error: 'missingProperty';
  property: string;
  validProperties: string[];
}

interface MisCasedProperty extends ErrorWithPath {
  error: 'misCasedProperty';
  foundProperty: string;
}

export type SchemaLookupError =
  | LocationNotFound
  | LookupFailed
  | RanOutOfAlternatives
  | ReferenceError
  | MissingRepeatingGroup
  | MissingProperty
  | MisCasedProperty;

type Ret = JSONSchema7 | SchemaLookupError;

export function findSchemaForBinding(props: Props): Ret {
  const { schema, rootElementPath, bindingPointer } = props;
  const root = rootElementPath ? lookupRef(rootElementPath, schema) : schema;
  const parts = bindingPointer.split('/').filter((part) => part !== '' && part !== '#');
  const currentPath: string[] = [''];

  if (isSchemaLookupError(root)) {
    return root;
  }

  let current = root;
  for (const part of parts) {
    currentPath.push(part);
    const isIndex = /^\d+$/.test(part);

    const alternatives = resolveAlternatives(current, schema);
    let foundInAlternatives = false;
    for (const alternative of alternatives) {
      if (foundInAlternatives) {
        continue;
      }

      if (alternative.properties && alternative.properties[part]) {
        const found = resolveRef(alternative.properties[part], schema);
        if (isSchemaLookupError(found)) {
          return found;
        }
        current = found;
        foundInAlternatives = true;
        continue;
      }

      if (typeof alternative.items === 'object' && isIndex) {
        const found = Array.isArray(alternative.items)
          ? resolveRef(alternative.items[parseInt(part, 10)] || alternative.items[0], schema)
          : resolveRef(alternative.items, schema);
        if (isSchemaLookupError(found)) {
          return found;
        }
        current = found;
        foundInAlternatives = true;
      }
    }

    if (!foundInAlternatives) {
      if (alternatives.length === 1) {
        const onlyAlternative = alternatives[0];
        const type = onlyAlternative.type;
        if (type === 'array' && !isIndex) {
          return makeError('missingRepeatingGroup', {
            stoppedAtPointer: currentPath.join('/'),
          });
        }
        if (type === 'object' || (type === undefined && onlyAlternative.properties)) {
          return makeError('missingProperty', {
            stoppedAtPointer: currentPath.join('/'),
            property: part,
            validProperties: Object.keys(onlyAlternative.properties || {}),
          });
        }
      }
      for (const alternative of alternatives) {
        if ((alternative.type === 'object' || alternative.type === undefined) && alternative.properties) {
          const lowerCaseMap: { [key: string]: string } = {};
          for (const key of Object.keys(alternative.properties)) {
            lowerCaseMap[key.toLowerCase()] = key;
          }
          if (lowerCaseMap[part.toLowerCase()]) {
            return makeError('misCasedProperty', {
              stoppedAtPointer: currentPath.join('/'),
              foundProperty: lowerCaseMap[part.toLowerCase()],
            });
          }
        }
      }

      return makeError('ranOutOfAlternatives', {
        evaluatedAlternatives: alternatives.length,
        stoppedAtPointer: currentPath.join('/'),
      });
    }
  }

  if (current === root) {
    return makeError('lookupFailed', {});
  }

  return (
    current ||
    makeError('locationNotFound', {
      stoppedAtPointer: currentPath.join('/'),
    })
  );
}

function lookupRef(path: string, schema: JSONSchema7): Ret {
  const resolved = pointer.get(schema, path.replace(/^#/g, ''));
  if (resolved) {
    return resolved as JSONSchema7;
  }

  return makeError('referenceError', {
    reference: path,
    stoppedAtPointer: path,
  });
}

function resolveRef(schema: JSONSchema7 | JSONSchema7Definition, rootSchema: JSONSchema7): Ret {
  let current = schema as JSONSchema7;
  while (current && typeof current === 'object' && '$ref' in current && current.$ref) {
    const next = lookupRef(current.$ref, rootSchema);
    if (isSchemaLookupError(next)) {
      return next;
    }
    current = next;
  }

  return current;
}

function resolveAlternatives(schema: JSONSchema7 | undefined, rootSchema: JSONSchema7): JSONSchema7[] {
  if (!schema) {
    return [];
  }

  const alternatives = [schema];
  for (const other of [schema.allOf, schema.anyOf, schema.oneOf]) {
    for (const _item of other || []) {
      let item = _item as JSONSchema7 | undefined;
      if (typeof item === 'object') {
        const resolvedItem = resolveRef(_item, rootSchema);
        if (!isSchemaLookupError(resolvedItem)) {
          item = resolvedItem;
        }
      }
      if (item && typeof item === 'object') {
        alternatives.push(...resolveAlternatives(item, rootSchema));
      }
    }
  }

  return alternatives;
}

export function isSchemaLookupError(error: JSONSchema7 | SchemaLookupError): error is SchemaLookupError {
  return error && 'isError' in error && error.isError;
}

export function isSchemaLookupSuccess(schema: JSONSchema7 | SchemaLookupError): schema is JSONSchema7 {
  return !!schema && typeof schema === 'object' && !isSchemaLookupError(schema);
}

type ErrorUnion = SchemaLookupError['error'];
type ErrorFromType<T extends ErrorUnion> = Extract<SchemaLookupError, { error: T }>;
type MinimalError<T extends ErrorUnion> = Omit<ErrorFromType<T>, 'isError' | 'error' | 'stoppedAtDotNotation'>;
function makeError<T extends ErrorUnion>(type: T, error: MinimalError<T>): ErrorFromType<T> {
  return {
    isError: true,
    error: type,
    ...error,
    ...('stoppedAtPointer' in error && typeof error.stoppedAtPointer === 'string'
      ? { stoppedAtDotNotation: pointerToDotNotation(error.stoppedAtPointer) }
      : {}),
  } as ErrorFromType<T>;
}

// PRIORITY: Make sure repeating group is actually Object[]
