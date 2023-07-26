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

  insertBefore(otherPropertyName: string): this {
    this._insertBefore = otherPropertyName;
    return this;
  }

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
}
