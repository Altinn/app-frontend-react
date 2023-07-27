import type { JSONSchema7 } from 'json-schema';

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

  toTypeScriptDefinition(symbol: string | undefined): string {
    return symbol ? `type ${symbol} = string;` : 'string';
  }

  toJsonSchema(): JSONSchema7 {
    return {
      ...this.getInternalJsonSchema(),
      type: 'string',
      pattern: this.pattern?.source,
    };
  }
}
