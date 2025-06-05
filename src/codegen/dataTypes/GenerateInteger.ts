import type { JSONSchema7 } from 'json-schema';

import { GenerateNumber } from 'src/codegen/dataTypes/GenerateNumber';
import type { PropNumber, PropSimpleUnion } from 'src/codegen/types';

/**
 * Generates an integer value. I.e. a value that is always a whole number.
 * This is a subclass of GenerateNumber, so it inherits all of its methods, so you can set min/max values.
 */
export class GenerateInteger extends GenerateNumber {
  constructor() {
    super();
  }

  toTypeScriptDefinition(symbol: string | undefined): string {
    return symbol ? `type ${symbol} = number;` : 'number';
  }

  toJsonSchemaDefinition(): JSONSchema7 {
    return {
      ...this.getInternalJsonSchema(),
      ...super.toJsonSchemaDefinition(),
      type: 'integer',
    };
  }

  toPropListDefinition(): PropNumber {
    return {
      ...this.getInternalPropList(),
      type: 'integer',
    };
  }

  canBeInSimpleUnion(): boolean {
    return true;
  }

  addToSimpleUnion(union: PropSimpleUnion) {
    union.types = union.types ?? [];
    union.types.push('integer');
  }
}
