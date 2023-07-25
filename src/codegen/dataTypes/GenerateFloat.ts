import { CodeGenerator } from 'src/codegen/CodeGenerator';

export class GenerateFloat extends CodeGenerator {
  constructor() {
    super();
  }
  toTypeScript() {
    return 'number';
  }
}
