import { CodeGenerator } from 'src/codegen/CodeGenerator';

export class GenerateUnion<U extends CodeGenerator<any>> extends CodeGenerator<U> {
  private types: U[];

  constructor(...types: U[]) {
    super();
    this.types = types;
  }

  addType(type: CodeGenerator<any>) {
    this.types.push(type as any);
  }

  toTypeScript() {
    return this.types.map((type) => type.toTypeScript()).join(' | ');
  }
}
