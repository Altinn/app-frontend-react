import type { JSONSchema7Definition } from 'json-schema';

import { CodeGenerator } from 'src/codegen/CodeGenerator';

export class GenerateSymbol extends CodeGenerator<any> {
  constructor(private readonly name: string) {
    super();
  }

  toJsonSchema(): JSONSchema7Definition {
    return {
      $ref: `#/definitions/${this.name}`,
    };
  }

  toTypeScript(): string {
    return this.name;
  }
}
