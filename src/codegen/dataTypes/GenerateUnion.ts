import type { JSONSchema7 } from 'json-schema';

import { DescribableCodeGenerator } from 'src/codegen/CodeGenerator';
import type { CodeGenerator } from 'src/codegen/CodeGenerator';

/**
 * Generates a union of multiple types. In typescript this is a regular union, and in JsonSchema it is an 'anyOf'.
 */
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

  containsExpressions(): boolean {
    return this.types.some((type) => type.containsExpressions());
  }

  transformToResolved(): this | CodeGenerator<any> {
    const types = this.types.map((type) => type.transformToResolved());
    const out = new GenerateUnion(...types);
    out.internal = this.internal;
    out.transformNameToResolved();

    return out;
  }

  _toTypeScriptDefinition(symbol: string | undefined): string {
    const out = this.types.map((type) => type._toTypeScript()).join(' | ');

    return symbol ? `type ${symbol} = ${out};` : out;
  }

  toJsonSchema(): JSONSchema7 {
    return {
      ...this.getInternalJsonSchema(),
      anyOf: this.types.map((type) => type.toJsonSchema()),
    };
  }
}
