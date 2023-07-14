import { CodeGenerator } from 'src/codegen/CodeGenerator';

export class GenerateNumber extends CodeGenerator {
  constructor() {
    super();
  }
  toTypeScript() {
    return 'number';
  }
}
