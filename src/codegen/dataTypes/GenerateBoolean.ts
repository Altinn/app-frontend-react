import type { JSONSchema7Definition } from 'json-schema';

import { DescribableCodeGenerator } from 'src/codegen/CodeGenerator';

export class GenerateBoolean extends DescribableCodeGenerator<boolean> {
  constructor() {
    super();
  }

  toTypeScriptDefinition(symbol: string | undefined): string {
    return symbol ? `type ${symbol} = boolean;` : 'boolean';
  }

  toJsonSchema(): JSONSchema7Definition {
    return {
      ...this.getInternalJsonSchema(),
      type: 'boolean',
    };
  }
}
