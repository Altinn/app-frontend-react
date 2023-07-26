import { DescribableCodeGenerator } from 'src/codegen/CodeGenerator';

export class GenerateInteger extends DescribableCodeGenerator<number> {
  constructor() {
    super();
  }
  toTypeScript() {
    return 'number';
  }
}
