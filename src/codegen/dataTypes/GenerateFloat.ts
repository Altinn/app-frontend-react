import type { JSONSchema7Definition } from 'json-schema';

import { DescribableCodeGenerator } from 'src/codegen/CodeGenerator';

export class GenerateFloat extends DescribableCodeGenerator<number> {
  constructor() {
    super();
  }
  toTypeScript() {
    return 'number';
  }

  toJsonSchema(): JSONSchema7Definition {
    return {
      ...this.getInternalJsonSchema(),
      type: 'number',
    };
  }
}
