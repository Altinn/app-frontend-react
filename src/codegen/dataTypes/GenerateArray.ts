import { DescribableCodeGenerator } from 'src/codegen/CodeGenerator';
import { GenerateUnion } from 'src/codegen/dataTypes/GenerateUnion';
import type { CodeGenerator } from 'src/codegen/CodeGenerator';

export class GenerateArray<Inner extends CodeGenerator<any>> extends DescribableCodeGenerator<Inner[]> {
  constructor(public readonly innerType: Inner) {
    super();
  }

  toTypeScript(): string {
    if (this.innerType instanceof GenerateUnion) {
      return `(${this.innerType.toTypeScript()})[]`;
    }

    return `${this.innerType.toTypeScript()}[]`;
  }
}
