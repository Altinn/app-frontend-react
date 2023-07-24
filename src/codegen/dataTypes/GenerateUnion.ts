import { CodeGenerator } from 'src/codegen/CodeGenerator';

export class GenerateUnion extends CodeGenerator {
  private types: CodeGenerator[];

  constructor(...types: CodeGenerator[]) {
    super();
    this.types = types;
  }

  addType(type: CodeGenerator) {
    this.types.push(type);
  }

  toTypeScript() {
    return this.types.map((type) => type.toTypeScript()).join(' | ');
  }
}
