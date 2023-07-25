import { CodeGenerator } from 'src/codegen/CodeGenerator';

export class GenerateFloat extends CodeGenerator<number> {
  constructor() {
    super();
  }
  toTypeScript() {
    return 'number';
  }
}
