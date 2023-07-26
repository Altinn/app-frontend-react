import type { JSONSchema7Definition } from 'json-schema';

import { DescribableCodeGenerator } from 'src/codegen/CodeGenerator';

export class GenerateEnum<T extends string | number> extends DescribableCodeGenerator<T> {
  public readonly values: T[];

  constructor(...values: T[]) {
    super();
    this.values = values;
  }

  toJsonSchema(): JSONSchema7Definition {
    return {
      ...this.getInternalJsonSchema(),
      enum: this.values,
    };
  }

  toTypeScriptDefinition(symbol: string | undefined): string {
    const out = this.values.map((value) => JSON.stringify(value)).join(' | ');

    // TODO: Support 'real' typescript enums
    return symbol ? `type ${symbol} = ${out};` : out;
  }
}
