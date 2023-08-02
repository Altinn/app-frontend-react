import type { JSONSchema7 } from 'json-schema';

import { DescribableCodeGenerator } from 'src/codegen/CodeGenerator';
import type { Variant } from 'src/codegen/CG';
import type { CodeGenerator, MaybeSymbolizedCodeGenerator } from 'src/codegen/CodeGenerator';

/**
 * Generates a union of multiple types. In typescript this is a regular union, and in JsonSchema it is an 'anyOf'.
 */
export class GenerateUnion<U extends CodeGenerator<any>[]> extends DescribableCodeGenerator<
  U[number] extends CodeGenerator<infer X> ? X : never
> {
  private types: U;

  constructor(...types: U) {
    super();
    this.types = types;
  }

  addType(type: CodeGenerator<any>) {
    this.types.push(type as any);
  }

  containsVariationDifferences(): boolean {
    if (this.internal.source?.containsVariationDifferences()) {
      return true;
    }

    return this.types.some((type) => type.containsVariationDifferences());
  }

  transformTo(variant: Variant): this | MaybeSymbolizedCodeGenerator<any> {
    if (this.currentVariant === variant) {
      return this;
    }

    const types = this.types.map((type) => type.transformTo(variant));
    const out = new GenerateUnion(...types);
    out.internal = structuredClone(this.internal);
    out.internal.source = this;
    out.currentVariant = variant;

    return out;
  }

  toTypeScriptDefinition(symbol: string | undefined): string {
    const out = this.types.map((type) => type.toTypeScript()).join(' | ');

    return symbol ? `type ${symbol} = ${out};` : out;
  }

  toJsonSchema(): JSONSchema7 {
    return {
      ...this.getInternalJsonSchema(),
      anyOf: this.types.map((type) => type.toJsonSchema()),
    };
  }
}
