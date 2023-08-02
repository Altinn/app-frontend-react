import type { JSONSchema7 } from 'json-schema';

import { DescribableCodeGenerator } from 'src/codegen/CodeGenerator';

/**
 * Generates a number value. I.e. a value that is always an integer or float.
 */
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

  toJsonSchema(): JSONSchema7 {
    return {
      ...this.getInternalJsonSchema(),
      type: 'number',
      minimum: this.minimum,
      maximum: this.maximum,
    };
  }

  containsVariationDifferences(): boolean {
    return this.internal.source?.containsVariationDifferences() || false;
  }
}
