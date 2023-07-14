import { CodeGenerator } from 'src/codegen/CodeGenerator';

export class GenerateUnion extends CodeGenerator {
  constructor(private types: CodeGenerator[]) {
    super();
  }

  addType(type: CodeGenerator) {
    this.types.push(type);
  }

  toTypeScript() {
    return this.types.map((type) => type.toTypeScript()).join(' | ');
  }
}
