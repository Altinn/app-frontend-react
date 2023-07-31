import type { JSONSchema7 } from 'json-schema';

import { DescribableCodeGenerator } from 'src/codegen/CodeGenerator';

/**
 * Generates an enum type. In typescript this is a union of string literals (or a proper enum),
 * but in JsonSchema it is always an enum. The types you provide here must always be either strings or numbers, never
 * a mix. If you need a mix, or more complex choices, use a union type instead.
 */
export class GenerateEnum<T extends string | number> extends DescribableCodeGenerator<T> {
  public readonly values: T[];

  constructor(...values: T[]) {
    super();
    this.values = values;
  }

  toJsonSchema(): JSONSchema7 {
    return {
      ...this.getInternalJsonSchema(),
      enum: this.values,
    };
  }

  _toTypeScriptDefinition(symbol: string | undefined): string {
    const out = this.values.map((value) => JSON.stringify(value)).join(' | ');

    // PRIORITY: Support 'real' typescript enums
    return symbol ? `type ${symbol} = ${out};` : out;
  }
}
