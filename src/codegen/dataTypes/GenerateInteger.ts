import { CodeGenerator } from 'src/codegen/CodeGenerator';

export class GenerateInteger extends CodeGenerator {
  constructor() {
    super();
  }
  toTypeScript() {
    return 'number';
  }
}
