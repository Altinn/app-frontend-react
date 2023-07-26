import type { JSONSchema7Definition } from 'json-schema';

import { CodeGenerator } from 'src/codegen/CodeGenerator';

export class GenerateProperty<Val extends CodeGenerator<any>> extends CodeGenerator<
  Val extends CodeGenerator<infer X> ? X : never
> {
  private _insertBefore?: string;
  private _insertAfter?: string;

  constructor(
    public readonly name: string,
    public readonly type: Val,
  ) {
    super();
  }

  /**
   * Important: Call this on the property object before adding it to the object
   */
  insertBefore(otherPropertyName: string): this {
    this._insertBefore = otherPropertyName;
    return this;
  }

  /**
   * Important: Call this on the property object before adding it to the object
   */
  insertAfter(otherPropertyName: string): this {
    this._insertAfter = otherPropertyName;
    return this;
  }

  toObject() {
    return {
      name: this.name,
      insertBefore: this._insertBefore,
      insertAfter: this._insertAfter,
    };
  }

  toTypeScript() {
    return this.type.internal.optional
      ? `${this.name}?: ${this.type.toTypeScript()};`
      : `${this.name}: ${this.type.toTypeScript()};`;
  }

  toJsonSchema(): JSONSchema7Definition {
    throw new Error('Do not call this directly, generate JsonSchema for the object (or property type) instead');
  }
}
