import type { JSONSchema7 } from 'json-schema';

import { GenerateNumber } from 'src/codegen/dataTypes/GenerateNumber';

export class GenerateInteger extends GenerateNumber {
  constructor() {
    super();
  }

  toTypeScriptDefinition(symbol: string | undefined): string {
    return symbol ? `type ${symbol} = number;` : 'number';
  }

  toJsonSchema(): JSONSchema7 {
    return {
      ...this.getInternalJsonSchema(),
      ...super.toJsonSchema(),
      type: 'integer',
    };
  }
}
