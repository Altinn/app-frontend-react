import { CodeGenerator } from 'src/codegen/CodeGenerator';

export class GenerateString extends CodeGenerator<string> {
  constructor() {
    super();
  }
  toTypeScript() {
    return 'string';
  }
}
