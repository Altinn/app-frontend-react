import { CodeGenerator } from 'src/codegen/CodeGenerator';

export class GenerateBoolean extends CodeGenerator<boolean> {
  constructor() {
    super();
  }
  toTypeScript() {
    return 'boolean';
  }
}
