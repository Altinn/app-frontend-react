import type { JSONSchema7 } from 'json-schema';

import { DescribableCodeGenerator } from 'src/codegen/CodeGenerator';

/**
 * Generates a boolean type
 */
export class GenerateBoolean extends DescribableCodeGenerator<boolean> {
  constructor() {
    super();
  }

  _toTypeScriptDefinition(symbol: string | undefined): string {
    return symbol ? `type ${symbol} = boolean;` : 'boolean';
  }

  toJsonSchema(): JSONSchema7 {
    return {
      ...this.getInternalJsonSchema(),
      type: 'boolean',
    };
  }
}
