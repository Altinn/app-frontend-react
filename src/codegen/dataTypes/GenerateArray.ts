import type { JSONSchema7Definition } from 'json-schema';

import { DescribableCodeGenerator } from 'src/codegen/CodeGenerator';
import { GenerateUnion } from 'src/codegen/dataTypes/GenerateUnion';
import type { CodeGenerator } from 'src/codegen/CodeGenerator';

export class GenerateArray<Inner extends CodeGenerator<any>> extends DescribableCodeGenerator<Inner[]> {
  constructor(public readonly innerType: Inner) {
    super();
  }

  toTypeScriptDefinition(symbol: string | undefined): string {
    const out =
      this.innerType instanceof GenerateUnion
        ? `(${this.innerType.toTypeScript()})[]`
        : `${this.innerType.toTypeScript()}[]`;

    return symbol ? `type ${symbol} = ${out};` : out;
  }

  toJsonSchema(): JSONSchema7Definition {
    return {
      ...this.getInternalJsonSchema(),
      type: 'array',
      items: this.innerType.toJsonSchema(),
    };
  }
}
