import type { JSONSchema7Definition } from 'json-schema';

import { DescribableCodeGenerator } from 'src/codegen/CodeGenerator';

export class GenerateString extends DescribableCodeGenerator<string> {
  private pattern: RegExp | undefined;

  constructor() {
    super();
  }

  setPattern(pattern: RegExp): this {
    this.pattern = pattern;
    return this;
  }

  toTypeScript() {
    return 'string';
  }

  toJsonSchema(): JSONSchema7Definition {
    return {
      ...this.getInternalJsonSchema(),
      type: 'string',
      pattern: this.pattern?.source,
    };
  }
}
