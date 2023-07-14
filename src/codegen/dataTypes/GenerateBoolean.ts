import { CodeGenerator } from 'src/codegen/CodeGenerator';

export class GenerateBoolean extends CodeGenerator {
  constructor() {
    super();
  }
  toTypeScript() {
    return 'boolean';
  }
}
