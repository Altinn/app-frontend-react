import pointer from 'json-pointer';
import type { JSONSchema7, JSONSchema7Definition } from 'json-schema';

import { pointerToDotNotation } from 'src/features/datamodel/notations';
import { isSchemaLookupError } from 'src/features/datamodel/SimpleSchemaTraversal.tools';
import type { SchemaLookupError } from 'src/features/datamodel/SimpleSchemaTraversal.tools';

interface Props {
  schema: JSONSchema7;
  bindingPointer: string;
  rootElementPath?: string;
}

type Ret = JSONSchema7 | SchemaLookupError;

class SimpleSchemaTraversal {
  private current: JSONSchema7;
  private fullPath: string[] = [''];

  constructor(
    private fullSchema: JSONSchema7,
    rootElementPath?: string,
  ) {
    this.current = rootElementPath ? this.lookupRef(rootElementPath) : fullSchema;
  }

  public getCurrent(): JSONSchema7 {
    return this.resolveRef(this.current);
  }

  public getPath(): string {
    return this.fullPath.join('/');
  }

  public gotoProperty(property: string): this {
    const foundProperties: string[] = [];
    const alternatives = this.getAlternatives();
    for (const alternative of alternatives) {
      if (alternative.properties) {
        if (alternative.properties[property]) {
          this.current = alternative.properties[property] as JSONSchema7;
          this.fullPath.push(property);
          return this;
        }

        foundProperties.push(...Object.keys(alternative.properties));
      }
    }

    const [isMisCased, correctCasing] = this.isMisCased(property, foundProperties);
    if (isMisCased) {
      throw this.makeError('misCasedProperty', {
        foundProperty: correctCasing,
      });
    }

    this.failIfRepeatingGroup(alternatives);

    // PRIORITY: Check if one of the properties is similar to the one we are looking for, and suggest that

    throw this.makeError('missingProperty', {
      property,
      validProperties: foundProperties,
    });
  }

  public gotoIndex(index: number): this {
    const alternatives = this.getAlternatives();
    for (const alternative of alternatives) {
      if (alternative.type === 'array' && alternative.items) {
        this.current = alternative.items as JSONSchema7;
        this.fullPath.push(`${index}`);
        return this;
      }
    }

    const actualType =
      alternatives.length === 1 && typeof alternatives[0].type === 'string' ? alternatives[0].type : undefined;
    throw this.makeError('notAnArray', { actualType });
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

  private failIfRepeatingGroup(alternatives: JSONSchema7[]): void {
    if (this.isRepeatingGroup(alternatives)) {
      throw this.makeError('missingRepeatingGroup', {});
    }
  }

  private isRepeatingGroup(alternatives: JSONSchema7[]): boolean {
    // PRIORITY: Make sure repeating group is actually Object[]
    return alternatives.some((alternative) => alternative.type === 'array' && alternative.items);
  }

  private lookupRef(path: string): JSONSchema7 {
    const resolved = pointer.get(this.fullSchema, path.replace(/^#/g, ''));
    if (resolved) {
      return resolved as JSONSchema7;
    }

    throw this.makeError('referenceError', { reference: path });
  }

  private resolveRef(item: JSONSchema7 | JSONSchema7Definition | undefined): JSONSchema7 {
    let current = item as JSONSchema7;
    while (current && typeof current === 'object' && '$ref' in current && current.$ref) {
      current = this.lookupRef(current.$ref);
    }

    return current;
  }

  private getAlternatives(item = this.current): JSONSchema7[] {
    const alternatives = [this.resolveRef(item)];
    const others = [item.allOf, item.anyOf, item.oneOf].map((list) => list?.map((i) => this.resolveRef(i)));
    for (const other of others) {
      for (const _item of other || []) {
        const item = this.resolveRef(_item);
        if (typeof item === 'object') {
          alternatives.push(...this.getAlternatives(item));
        }
      }
    }

    return alternatives;
  }

  private makeError<T extends ErrorUnion>(type: T, error: MinimalError<T>): ErrorFromType<T> {
    return {
      isError: true,
      error: type,
      stoppedAtPointer: this.getPath(),
      stoppedAtDotNotation: pointerToDotNotation(this.getPath()),
      ...error,
    } as ErrorFromType<T>;
  }
}

type ErrorUnion = SchemaLookupError['error'];
type ErrorFromType<T extends ErrorUnion> = Extract<SchemaLookupError, { error: T }>;
type MinimalError<T extends ErrorUnion> = Omit<
  ErrorFromType<T>,
  'isError' | 'error' | 'stoppedAtDotNotation' | 'stoppedAtPointer'
>;

export function lookupBindingInSchema(props: Props): Ret {
  const { schema, rootElementPath, bindingPointer } = props;
  const parts = bindingPointer.split('/').filter((part) => part !== '' && part !== '#');

  try {
    const traverser = new SimpleSchemaTraversal(schema, rootElementPath);
    for (const part of parts) {
      const isIndex = /^\d+$/.test(part);
      if (isIndex) {
        traverser.gotoIndex(parseInt(part, 10));
      } else {
        traverser.gotoProperty(part);
      }
    }
    return traverser.getCurrent();
  } catch (error) {
    if (isSchemaLookupError(error)) {
      return error;
    }
    throw error;
  }
}
