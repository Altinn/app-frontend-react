import { CodeGenerator } from 'src/codegen/CodeGenerator';

export class GenerateInteger extends CodeGenerator<number> {
  constructor() {
    super();
  }
  toTypeScript() {
    return 'number';
  }
}
