import type { JSONSchema7Definition } from 'json-schema';

import { DescribableCodeGenerator } from 'src/codegen/CodeGenerator';

export class GenerateBoolean extends DescribableCodeGenerator<boolean> {
  constructor() {
    super();
  }
  toTypeScript() {
    return 'boolean';
  }

  toJsonSchema(): JSONSchema7Definition {
    return {
      ...this.getInternalJsonSchema(),
      type: 'boolean',
    };
  }
}
