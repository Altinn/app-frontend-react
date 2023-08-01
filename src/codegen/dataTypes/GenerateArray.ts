import type { JSONSchema7 } from 'json-schema';

import { DescribableCodeGenerator } from 'src/codegen/CodeGenerator';
import { GenerateUnion } from 'src/codegen/dataTypes/GenerateUnion';
import type { CodeGenerator } from 'src/codegen/CodeGenerator';

/**
 * Generates an array with inner items of the given type
 */
export class GenerateArray<Inner extends CodeGenerator<any>> extends DescribableCodeGenerator<Inner[]> {
  private _minItems?: number;
  private _maxItems?: number;

  constructor(public readonly innerType: Inner) {
    super();
  }

  setMinItems(minItems: number): this {
    this._minItems = minItems;
    return this;
  }

  setMaxItems(maxItems: number): this {
    this._maxItems = maxItems;
    return this;
  }

  _toTypeScriptDefinition(symbol: string | undefined): string {
    const out =
      this.innerType instanceof GenerateUnion
        ? `(${this.innerType._toTypeScript()})[]`
        : `${this.innerType._toTypeScript()}[]`;

    return symbol ? `type ${symbol} = ${out};` : out;
  }

  toJsonSchema(): JSONSchema7 {
    return {
      ...this.getInternalJsonSchema(),
      type: 'array',
      items: this.innerType.toJsonSchema(),
      minItems: this._minItems,
      maxItems: this._maxItems,
    };
  }

  containsExpressions(): boolean {
    return this.innerType.containsExpressions();
  }

  transformToInternal(): this | CodeGenerator<any> {
    const out = new GenerateArray(this.innerType.transformToInternal());
    out.internal = structuredClone(this.internal);

    return out;
  }
}
