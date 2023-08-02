import type { JSONSchema7 } from 'json-schema';

import { DescribableCodeGenerator } from 'src/codegen/CodeGenerator';
import { GenerateUnion } from 'src/codegen/dataTypes/GenerateUnion';
import type { Variant } from 'src/codegen/CG';
import type { CodeGenerator, MaybeSymbolizedCodeGenerator } from 'src/codegen/CodeGenerator';

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

  toTypeScriptDefinition(symbol: string | undefined): string {
    const out =
      this.innerType instanceof GenerateUnion
        ? `(${this.innerType.toTypeScript()})[]`
        : `${this.innerType.toTypeScript()}[]`;

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

  containsVariationDifferences(): boolean {
    return this.internal.source?.containsVariationDifferences() || this.innerType.containsVariationDifferences();
  }

  transformTo(variant: Variant): this | MaybeSymbolizedCodeGenerator<any> {
    if (this.currentVariant === variant) {
      return this;
    }

    const out = new GenerateArray(this.innerType.transformTo(variant));
    out.internal = structuredClone(this.internal);
    out.internal.source = this;
    out.currentVariant = variant;

    return out;
  }
}
