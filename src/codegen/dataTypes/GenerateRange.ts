import type { JSONSchema7 } from 'json-schema';

import { DescribableCodeGenerator } from 'src/codegen/CodeGenerator';
import type { PropRange, PropSimpleUnion } from 'src/codegen/types';

/**
 * Generates a number range, i.e. 1-5.
 */
export class GenerateRange extends DescribableCodeGenerator<number> {
  private readonly minimum: number;
  private readonly maximum: number;

  constructor(min: number, max: number) {
    super();
    this.minimum = min;
    this.maximum = max;
  }

  toTypeScriptDefinition(symbol: string | undefined): string {
    const values = new Array(this.maximum - this.minimum + 1).fill(0).map((_, i) => this.minimum + i);
    return symbol
      ? `type ${symbol} = ${values.map((v) => JSON.stringify(v)).join(' | ')};`
      : values.map((v) => JSON.stringify(v)).join(' | ');
  }

  toJsonSchemaDefinition(): JSONSchema7 {
    return {
      ...this.getInternalJsonSchema(),
      type: 'number',
      minimum: this.minimum,
      maximum: this.maximum,
    };
  }

  toPropListDefinition(): PropRange {
    return {
      ...this.getInternalPropList(),
      type: 'range',
      minimum: this.minimum,
      maximum: this.maximum,
      asText: `${this.minimum}-${this.maximum}`,
    };
  }

  canBeInSimpleUnion(): boolean {
    return true;
  }

  addToSimpleUnion(union: PropSimpleUnion) {
    union.ranges = union.ranges ?? [];
    union.ranges.push({ min: this.minimum, max: this.maximum });
  }
}
