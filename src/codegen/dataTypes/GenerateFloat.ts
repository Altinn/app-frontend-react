import { DescribableCodeGenerator } from 'src/codegen/CodeGenerator';

export class GenerateFloat extends DescribableCodeGenerator<number> {
  constructor() {
    super();
  }
  toTypeScript() {
    return 'number';
  }
}
