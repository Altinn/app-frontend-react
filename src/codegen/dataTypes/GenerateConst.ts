import { CodeGenerator } from 'src/codegen/CodeGenerator';

export class GenerateConst extends CodeGenerator {
  constructor(public readonly value: string | boolean | number) {
    super();
  }
  public toTypeScript(): string {
    if (typeof this.value === 'number') {
      return `${this.value}`;
    }
    if (typeof this.value === 'boolean') {
      return `${this.value ? 'true' : 'false'}`;
    }
    return `'${this.value}'`;
  }
}
