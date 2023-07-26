import type { JSONSchema7, JSONSchema7Definition } from 'json-schema';

import { GenerateNumber } from 'src/codegen/dataTypes/GenerateNumber';

export class GenerateInteger extends GenerateNumber {
  constructor() {
    super();
  }

  toTypeScriptDefinition(symbol: string | undefined): string {
    return symbol ? `type ${symbol} = number;` : 'number';
  }

  toJsonSchema(): JSONSchema7Definition {
    return {
      ...this.getInternalJsonSchema(),
      ...(super.toJsonSchema() as JSONSchema7),
      type: 'integer',
    };
  }
}
