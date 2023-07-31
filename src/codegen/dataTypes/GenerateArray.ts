import type { JSONSchema7 } from 'json-schema';

import { DescribableCodeGenerator } from 'src/codegen/CodeGenerator';
import { GenerateUnion } from 'src/codegen/dataTypes/GenerateUnion';
import type { CodeGenerator } from 'src/codegen/CodeGenerator';

/**
 * Generates an array with inner items of the given type
 */
export class GenerateArray<Inner extends CodeGenerator<any>> extends DescribableCodeGenerator<Inner[]> {
  constructor(public readonly innerType: Inner) {
    super();
  }

  _toTypeScriptDefinition(symbol: string | undefined): string {
    const out =
      this.innerType instanceof GenerateUnion
        ? `(${this.innerType._toTypeScript()})[]`
        : `${this.innerType._toTypeScript()}[]`;

    return symbol ? `type ${symbol} = ${out};` : out;
  }

  toJsonSchema(): JSONSchema7 {
    return {
      ...this.getInternalJsonSchema(),
      type: 'array',
      items: this.innerType.toJsonSchema(),
    };
  }
}
