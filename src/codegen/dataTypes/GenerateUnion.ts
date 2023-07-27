import type { JSONSchema7 } from 'json-schema';

import { DescribableCodeGenerator } from 'src/codegen/CodeGenerator';
import type { CodeGenerator } from 'src/codegen/CodeGenerator';

export class GenerateUnion<U extends CodeGenerator<any>[]> extends DescribableCodeGenerator<
  U[number] extends CodeGenerator<infer X> ? X : never
> {
  private types: U;

  constructor(...types: U) {
    super();
    this.types = types;
  }

  addType(type: CodeGenerator<any>) {
    this.types.push(type as any);
  }

  toTypeScriptDefinition(symbol: string | undefined): string {
    const out = this.types.map((type) => type.toTypeScript()).join(' | ');

    return symbol ? `type ${symbol} = ${out};` : out;
  }

  toJsonSchema(): JSONSchema7 {
    return {
      ...this.getInternalJsonSchema(),
      anyOf: this.types.map((type) => type.toJsonSchema()),
    };
  }
}
