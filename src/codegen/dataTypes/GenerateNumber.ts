import type { JSONSchema7Definition } from 'json-schema';

import { DescribableCodeGenerator } from 'src/codegen/CodeGenerator';

export class GenerateNumber extends DescribableCodeGenerator<number> {
  private minimum?: number;
  private maximum?: number;

  constructor() {
    super();
  }

  setMin(minimum: number) {
    this.minimum = minimum;
    return this;
  }

  setMax(maximum: number) {
    this.maximum = maximum;
    return this;
  }

  toTypeScriptDefinition(symbol: string | undefined): string {
    return symbol ? `type ${symbol} = number;` : 'number';
  }

  toJsonSchema(): JSONSchema7Definition {
    return {
      ...this.getInternalJsonSchema(),
      type: 'number',
      minimum: this.minimum,
      maximum: this.maximum,
    };
  }
}
