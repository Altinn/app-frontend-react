import type { JSONSchema7 } from 'json-schema';

import { CodeGenerator } from 'src/codegen/CodeGenerator';
import { CodeGeneratorContext, TsVariant } from 'src/codegen/CodeGeneratorContext';

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
  private _onlyVariant?: TsVariant;

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

  onlyIn(variant: TsVariant): this {
    this._onlyVariant = variant;
    return this;
  }

  shouldExistIn(variant: TsVariant): boolean {
    return !this._onlyVariant || this._onlyVariant === variant;
  }

  shouldExistInCurrentVariant(): boolean {
    return this.shouldExistIn(CodeGeneratorContext.getTypeScriptInstance().variant);
  }

  toObject() {
    return {
      name: this.name,
      insertBefore: this._insertBefore,
      insertAfter: this._insertAfter,
      insertFirst: this._insertFirst,
    };
  }

  containsExpressions(): boolean {
    return this.type.containsExpressions();
  }

  transformToResolved(): GenerateProperty<any> {
    if (this._onlyVariant === TsVariant.Unresolved) {
      throw new Error(
        'Cannot transform to resolved when the property is not supposed to be present in resolved ' +
          'variants. This is probably a bug, as the property should have been filtered out before this point.',
      );
    }

    const resolvedType = this.type.transformToResolved();
    const next = new GenerateProperty(this.name, resolvedType);
    next._insertFirst = this._insertFirst;
    next._insertBefore = this._insertBefore;
    next._insertAfter = this._insertAfter;
    next._onlyVariant = this._onlyVariant;
    next.internal = structuredClone(this.internal);

    return next;
  }

  _toTypeScript() {
    if (this._onlyVariant && CodeGeneratorContext.getTypeScriptInstance().variant !== this._onlyVariant) {
      throw new Error(
        'This property is not supposed to be present in this variant. This is probably a bug, ' +
          'as the property should have been filtered out before this point.',
      );
    }

    return this.type.internal.optional
      ? `${this.name}?: ${this.type._toTypeScript()};`
      : `${this.name}: ${this.type._toTypeScript()};`;
  }

  toJsonSchema(): JSONSchema7 {
    throw new Error('Do not call this directly, generate JsonSchema for the object (or property type) instead');
  }
}
