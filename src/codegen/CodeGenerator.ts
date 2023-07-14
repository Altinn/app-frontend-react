export abstract class CodeGenerator {
  public isOptional = false;
  public default?: CodeGenerator;

  public optional(defaultValue?: CodeGenerator): this {
    this.isOptional = true;
    this.default = defaultValue;
    return this;
  }

  public abstract toTypeScript(): string;
}
