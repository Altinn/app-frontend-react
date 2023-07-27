import type { JSONSchema7 } from 'json-schema';

import { DescribableCodeGenerator } from 'src/codegen/CodeGenerator';

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

  toTypeScriptDefinition(symbol: string | undefined): string {
    const out = this.values.map((value) => JSON.stringify(value)).join(' | ');

    // PRIORITY: Support 'real' typescript enums
    return symbol ? `type ${symbol} = ${out};` : out;
  }
}
