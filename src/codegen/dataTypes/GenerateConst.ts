import type { JSONSchema7Definition } from 'json-schema';

import { DescribableCodeGenerator } from 'src/codegen/CodeGenerator';

export class GenerateConst<Val extends string | boolean | number | null> extends DescribableCodeGenerator<Val> {
  constructor(public readonly value: Val) {
    super();
  }
  public toTypeScript(): string {
    if (typeof this.value === 'number') {
      return `${this.value}`;
    }
    if (typeof this.value === 'boolean') {
      return `${this.value ? 'true' : 'false'}`;
    }
    if (this.value === null) {
      return 'null';
    }

    return `'${this.value}'`;
  }

  toJsonSchema(): JSONSchema7Definition {
    return {
      ...this.getInternalJsonSchema(),
      const: this.value,
    };
  }
}
