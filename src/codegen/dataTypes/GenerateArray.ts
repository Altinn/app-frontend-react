import { CodeGenerator } from 'src/codegen/CodeGenerator';

export class GenerateArray extends CodeGenerator {
  constructor(public readonly innerType: CodeGenerator) {
    super();
  }

  toTypeScript(): string {
    return `${this.innerType.toTypeScript()}[]`;
  }
}
