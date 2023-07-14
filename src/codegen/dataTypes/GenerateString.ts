import { CodeGenerator } from 'src/codegen/CodeGenerator';

export class GenerateString extends CodeGenerator {
  constructor() {
    super();
  }
  toTypeScript() {
    return 'string';
  }
}
