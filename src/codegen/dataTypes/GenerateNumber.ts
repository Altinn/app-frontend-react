import type { JSONSchema7 } from 'json-schema';

import { DescribableCodeGenerator } from 'src/codegen/CodeGenerator';
import type { PropNumber, PropSimpleUnion } from 'src/codegen/types';

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
    this.ensureMutable();
    this.minimum = minimum;
    return this;
  }

  setMax(maximum: number) {
    this.ensureMutable();
    this.maximum = maximum;
    return this;
  }

  toTypeScriptDefinition(symbol: string | undefined): string {
    return symbol ? `type ${symbol} = number;` : 'number';
  }

  toJsonSchemaDefinition(): JSONSchema7 {
    return {
      ...this.getInternalJsonSchema(),
      type: 'number',
      minimum: this.minimum,
      maximum: this.maximum,
    };
  }

  toPropListDefinition(): PropNumber {
    return {
      ...this.getInternalPropList(),
      type: 'number',
      minimum: this.minimum,
      maximum: this.maximum,
    };
  }

  canBeInSimpleUnion(): boolean {
    if (this.minimum === undefined && this.maximum === undefined) {
      return true;
    }
    return this.maximum !== undefined && this.minimum !== undefined;
  }

  addToSimpleUnion(union: PropSimpleUnion) {
    if (this.minimum !== undefined && this.maximum !== undefined) {
      union.ranges = union.ranges ?? [];
      union.ranges.push({ min: this.minimum, max: this.maximum });
    } else {
      union.types = union.types ?? [];
      union.types.push('number');
    }
  }
}
