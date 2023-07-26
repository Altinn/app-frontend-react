import { DescribableCodeGenerator } from 'src/codegen/CodeGenerator';

export class GenerateBoolean extends DescribableCodeGenerator<boolean> {
  constructor() {
    super();
  }
  toTypeScript() {
    return 'boolean';
  }
}
