import { DescribableCodeGenerator } from 'src/codegen/CodeGenerator';

export class GenerateString extends DescribableCodeGenerator<string> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private pattern: RegExp | undefined;

  constructor() {
    super();
  }

  setPattern(pattern: RegExp): this {
    this.pattern = pattern;
    return this;
  }

  toTypeScript() {
    return 'string';
  }
}
