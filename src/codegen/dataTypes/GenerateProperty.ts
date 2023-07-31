import type { JSONSchema7 } from 'json-schema';

import { CodeGenerator } from 'src/codegen/CodeGenerator';

/**
 * Generates a property on an object. Remember to call insertBefore/insertAfter/insertFirst before adding it to
 * the object (by calling obj.addProperty(<this object>)).
 */
export class GenerateProperty<Val extends CodeGenerator<any>> extends CodeGenerator<
  Val extends CodeGenerator<infer X> ? X : never
> {
  private _insertBefore?: string;
  private _insertAfter?: string;
  private _insertFirst = false;

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

  /**
   * Important: Call this on the property object before adding it to the object
   */
  insertFirst(): this {
    this._insertBefore = undefined;
    this._insertAfter = undefined;
    this._insertFirst = true;
    return this;
  }

  toObject() {
    return {
      name: this.name,
      insertBefore: this._insertBefore,
      insertAfter: this._insertAfter,
      insertFirst: this._insertFirst,
    };
  }

  transformToResolved(): GenerateProperty<any> {
    const next = new GenerateProperty(this.name, this.type.transformToResolved());
    next._insertFirst = this._insertFirst;
    next._insertBefore = this._insertBefore;
    next._insertAfter = this._insertAfter;
    next.internal = this.internal;

    return next;
  }

  _toTypeScript() {
    return this.type.internal.optional
      ? `${this.name}?: ${this.type._toTypeScript()};`
      : `${this.name}: ${this.type._toTypeScript()};`;
  }

  toJsonSchema(): JSONSchema7 {
    throw new Error('Do not call this directly, generate JsonSchema for the object (or property type) instead');
  }
}
