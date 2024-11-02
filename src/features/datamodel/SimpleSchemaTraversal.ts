import levenshtein from 'js-levenshtein';
import pointer from 'jsonpointer';
import type { JSONSchema7, JSONSchema7Definition } from 'json-schema';

import { pointerToDotNotation } from 'src/features/datamodel/notations';
import { isSchemaLookupError } from 'src/features/datamodel/SimpleSchemaTraversal.tools';
import type { SchemaLookupError } from 'src/features/datamodel/SimpleSchemaTraversal.tools';

interface Props {
  schema: JSONSchema7;
  targetPointer: string;
  rootElementPath?: string;
}

type SchemaLocation = {
  schema: JSONSchema7;
  schemaPath: string[];
};

function isJsonSchema(schema: JSONSchema7Definition | null | undefined): schema is JSONSchema7 {
  return schema != null && typeof schema !== 'boolean';
}

/**
 * A simple JSON schema traversal tool that can be used to lookup a binding in a schema to find the
 * corresponding JSON schema definition for that binding.
 */
class SimpleSchemaTraversal {
  private currentLocation: SchemaLocation;
  private currentPath: string[] = [''];

  constructor(
    private fullSchema: JSONSchema7,
    private targetPointer: string,
    rootElementPath?: string,
  ) {
    this.currentLocation = rootElementPath ? this.lookupRef(rootElementPath) : { schema: fullSchema, schemaPath: [''] };
  }

  public get(location = this.currentLocation): SchemaLocation {
    const resolvedLocation = this.resolveRef(location);
    if (resolvedLocation.schema && Array.isArray(resolvedLocation.schema.type)) {
      const nonNullables = resolvedLocation.schema.type.filter((type) => type !== 'null');
      if (nonNullables.length === 1) {
        return {
          schema: {
            ...resolvedLocation.schema,
            type: nonNullables[0],
          },
          schemaPath: resolvedLocation.schemaPath,
        };
      }
    }
    if (resolvedLocation.schema && resolvedLocation.schema.oneOf) {
      const nonNullables = resolvedLocation.schema.oneOf
        .map((schema, i) =>
          schema && typeof schema !== 'boolean'
            ? this.resolveRef({ schema, schemaPath: [...resolvedLocation.schemaPath, 'oneOf', `${i}`] })
            : null,
        )
        .filter((location) => location !== null)
        .filter((location) => location.schema.type !== 'null');
      if (nonNullables.length === 1) {
        return this.resolveRef(nonNullables[0]);
      }
    }

    if (resolvedLocation.schema && resolvedLocation.schema.type === undefined && resolvedLocation.schema.properties) {
      return {
        schema: {
          ...resolvedLocation.schema,
          type: 'object',
        },
        schemaPath: resolvedLocation.schemaPath,
      };
    }

    return resolvedLocation;
  }

  public getAsResolved(location = this.currentLocation): JSONSchema7 {
    const { schema } = structuredClone(this.get(location));

    const recursiveResolve = (obj: JSONSchema7 | JSONSchema7Definition) => {
      if (typeof obj === 'object' && !Array.isArray(obj)) {
        if (obj.$ref) {
          const { schema: resolved } = structuredClone(
            this.resolveRef({ schema: obj, schemaPath: [] /* We don't care about the path in this case */ }),
          );
          return recursiveResolve(resolved);
        }
        if (obj.properties) {
          for (const key in obj.properties) {
            obj.properties[key] = recursiveResolve(obj.properties[key]) as JSONSchema7Definition;
          }
          if (!obj.type) {
            obj.type = 'object';
          }
        }
        if (obj.items && typeof obj.items === 'object' && !Array.isArray(obj.items)) {
          obj.items = recursiveResolve(obj.items) as JSONSchema7Definition;
          if (!obj.type) {
            obj.type = 'array';
          }
        }
        if (obj.items && Array.isArray(obj.items)) {
          obj.items = obj.items.map((i) => recursiveResolve(i));
          if (!obj.type) {
            obj.type = 'array';
          }
        }
        if (obj.allOf) {
          obj.allOf = obj.allOf.map((i) => recursiveResolve(i));
        }
        if (obj.anyOf) {
          obj.anyOf = obj.anyOf.map((i) => recursiveResolve(i));
        }
        if (obj.oneOf) {
          obj.oneOf = obj.oneOf.map((i) => recursiveResolve(i));
        }
      }

      return obj;
    };

    return recursiveResolve(schema) as JSONSchema7;
  }

  public getCurrentPath(): string {
    return this.currentPath.join('/');
  }

  public getCurrentSchemaPath(): string {
    return this.currentLocation.schemaPath.join('/');
  }

  public gotoProperty(property: string): this {
    const foundProperties: string[] = [];
    const alternatives = this.getAlternatives();
    for (const location of alternatives) {
      if (location.schema.properties) {
        if (location.schema.properties[property]) {
          this.currentLocation = {
            schema: location.schema.properties[property] as JSONSchema7,
            schemaPath: [...location.schemaPath, 'properties', property],
          };
          this.currentPath.push(property);
          return this;
        }

        foundProperties.push(...Object.keys(location.schema.properties));
      }
    }

    const [isMisCased, correctCasing] = this.isMisCased(property, foundProperties);
    if (isMisCased) {
      throw this.makeError('misCasedProperty', {
        actualName: correctCasing,
        referencedName: property,
      });
    }

    if (this.isRepeatingGroup(alternatives)) {
      throw this.makeError('missingRepeatingGroup', {});
    }

    const sortedByLikeness = foundProperties.sort((a, b) => levenshtein(property, a) - levenshtein(property, b));
    const mostLikelyProperty = sortedByLikeness[0];
    const likeness = mostLikelyProperty && levenshtein(property, mostLikelyProperty);
    const similarity = likeness && Math.round((1 - likeness / property.length) * 100);

    throw this.makeError('missingProperty', {
      property,
      mostLikelyProperty: similarity && similarity > 50 ? mostLikelyProperty : undefined,
      validProperties: foundProperties,
    });
  }

  public gotoIndex(index: number): this {
    const alternatives = this.getAlternatives();
    for (const location of alternatives) {
      if (
        (location.schema.type === 'array' ||
          (Array.isArray(location.schema.type) && location.schema.type.includes('array'))) &&
        location.schema.items
      ) {
        this.currentLocation = {
          schema: location.schema.items as JSONSchema7,
          schemaPath: [...location.schemaPath, 'items'],
        };
        this.currentPath.push(`${index}`);
        return this;
      }
    }

    const actual = alternatives.length === 1 ? this.get(alternatives[0]) : undefined;
    throw this.makeError('notAnArray', {
      actualType: typeof actual?.schema.type === 'string' ? actual.schema.type : undefined,
    });
  }

  private isMisCased(property: string, foundProperties: string[]): [boolean, string] {
    const lowerCaseMap: { [key: string]: string } = {};
    for (const key of foundProperties) {
      lowerCaseMap[key.toLowerCase()] = key;
    }
    if (lowerCaseMap[property.toLowerCase()]) {
      return [true, lowerCaseMap[property.toLowerCase()]];
    }

    return [false, ''];
  }

  private isRepeatingGroup(alternatives: SchemaLocation[]): boolean {
    return alternatives.some((location) => {
      if (location.schema.type === 'array' && location.schema.items) {
        const items =
          typeof location.schema.items === 'object' && !Array.isArray(location.schema.items)
            ? this.resolveRef(location)
            : undefined;

        if (typeof items === 'object' && (items[0].type === 'object' || items[0].properties)) {
          return true;
        }
      }
      return false;
    });
  }

  private lookupRef(ref: string): SchemaLocation {
    const path = ref.replace(/^#/g, '');
    const schema = pointer.get(this.fullSchema, path);
    if (schema) {
      return { schema: schema as JSONSchema7, schemaPath: path.split('/') };
    }

    throw this.makeError('referenceError', { reference: ref });
  }

  /**
   * Resolve $ref that points to another place in the schema (maybe recursive),
   * and resolve other rarities (like allOf that combines an empty schema)
   */
  private resolveRef(location = this.currentLocation): SchemaLocation {
    let currentLocation = { ...location };
    while (
      currentLocation.schema &&
      typeof currentLocation.schema === 'object' &&
      '$ref' in currentLocation.schema &&
      currentLocation.schema.$ref
    ) {
      currentLocation = this.lookupRef(currentLocation.schema.$ref);
    }

    if (
      currentLocation.schema &&
      typeof currentLocation.schema === 'object' &&
      'allOf' in currentLocation.schema &&
      currentLocation.schema.allOf
    ) {
      const nonEmptyAllOf = currentLocation.schema.allOf
        .map((schema, index) => ({ schema, schemaPath: [...currentLocation.schemaPath, 'allOf', `${index}`] }))
        .filter(({ schema }) => isJsonSchema(schema) && Object.keys(schema).length > 0);

      if (nonEmptyAllOf.length === 1) {
        currentLocation = this.resolveRef(nonEmptyAllOf[0] as SchemaLocation);
      }
    }

    return currentLocation;
  }

  public getAlternatives(location = this.currentLocation): SchemaLocation[] {
    const currentLocation = this.resolveRef(location);
    const alternatives = [currentLocation];
    const others: SchemaLocation[] = ['allOf', 'anyOf', 'oneOf'].flatMap(
      (key: 'allOf' | 'anyOf' | 'oneOf') =>
        currentLocation.schema[key]
          ?.map((schema, i) =>
            isJsonSchema(schema)
              ? this.resolveRef({ schema, schemaPath: [...currentLocation.schemaPath, key, `${i}`] })
              : null,
          )
          .filter((other) => other !== null) ?? [],
    );
    for (const other of others) {
      const innerLocation = this.resolveRef(other);
      if (typeof innerLocation.schema === 'object') {
        const innerAlternatives = this.getAlternatives(innerLocation);
        alternatives.push(...innerAlternatives);
      }
    }

    return alternatives;
  }

  private makeError<T extends ErrorUnion>(type: T, error: MinimalError<T>): ErrorFromType<T> {
    return {
      error: type,
      fullPointer: this.targetPointer,
      fullDotNotation: pointerToDotNotation(this.targetPointer),
      stoppedAtPointer: this.getCurrentPath(),
      stoppedAtDotNotation: pointerToDotNotation(this.getCurrentPath()),
      ...error,
    } as ErrorFromType<T>;
  }
}

type ErrorUnion = SchemaLookupError['error'];
type ErrorFromType<T extends ErrorUnion> = Extract<SchemaLookupError, { error: T }>;
type MinimalError<T extends ErrorUnion> = Omit<
  ErrorFromType<T>,
  'isError' | 'error' | 'stoppedAtDotNotation' | 'stoppedAtPointer' | 'fullPointer' | 'fullDotNotation'
>;

export type SchemaLookupResult = [JSONSchema7, undefined] | [undefined, SchemaLookupError];

/**
 * Looks up a binding in a schema to find the corresponding JSON schema definition for that binding.
 * Uses the SimpleSchemaTraversal class to do the actual lookup, but use this function instead of
 * instantiating the class directly.
 */
export function lookupBindingInSchema(props: Props): SchemaLookupResult {
  const { schema, rootElementPath, targetPointer } = props;

  try {
    const traverser = new SimpleSchemaTraversal(schema, targetPointer, rootElementPath);
    const parts = targetPointer.split('/').filter((part) => part !== '' && part !== '#');
    for (const part of parts) {
      const isIndex = /^\d+$/.test(part);
      if (isIndex) {
        traverser.gotoIndex(parseInt(part, 10));
      } else {
        traverser.gotoProperty(part);
      }
    }
    return [traverser.getAsResolved(), undefined];
  } catch (error) {
    if (isSchemaLookupError(error)) {
      return [undefined, error];
    }
    throw error;
  }
}

export function lookupPropertiesInSchema(schema: JSONSchema7, rootElementPath: string): Set<string> {
  const traverser = new SimpleSchemaTraversal(schema, '', rootElementPath);
  const resolved = traverser.getAsResolved();
  if (resolved.properties) {
    return new Set(Object.keys(resolved.properties));
  }

  const alternatives = traverser.getAlternatives();
  const properties = new Set<string>();
  for (const location of alternatives) {
    if (location.schema.properties) {
      for (const key of Object.keys(location.schema.properties)) {
        properties.add(key);
      }
    }
  }

  return properties;
}

export function lookupPathInSchema(props: Props): string | null {
  const { schema, rootElementPath, targetPointer } = props;

  try {
    const traverser = new SimpleSchemaTraversal(schema, targetPointer, rootElementPath);
    const parts = targetPointer.split('/').filter((part) => part !== '' && part !== '#');
    for (const part of parts) {
      const isIndex = /^\d+$/.test(part);
      if (isIndex) {
        traverser.gotoIndex(parseInt(part, 10));
      } else {
        traverser.gotoProperty(part);
      }
    }
    return traverser.getCurrentSchemaPath();
  } catch {
    window.logWarnOnce(`Unable to find ${targetPointer} in schema`);
    return null;
  }
}
