import type { JSONSchema7 } from 'json-schema';

import { DescribableCodeGenerator } from 'src/codegen/CodeGenerator';
import type { PropBool } from 'src/codegen/types';

/**
 * Generates a boolean type
 */
export class GenerateBoolean extends DescribableCodeGenerator<boolean> {
  constructor() {
    super();
  }

  toTypeScriptDefinition(symbol: string | undefined): string {
    return symbol ? `type ${symbol} = boolean;` : 'boolean';
  }

  toJsonSchemaDefinition(): JSONSchema7 {
    return {
      ...this.getInternalJsonSchema(),
      type: 'boolean',
    };
  }

  toPropListDefinition(): PropBool {
    return {
      ...this.getInternalPropList(),
      type: 'boolean',
    };
  }
}
