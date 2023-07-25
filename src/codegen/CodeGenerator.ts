export abstract class CodeGenerator<T> {
  public isOptional = false;
  public default?: CodeGenerator<T>;

  public optional(defaultValue?: CodeGenerator<T>): this {
    this.isOptional = true;
    this.default = defaultValue;
    return this;
  }

  public abstract toTypeScript(): string;
}
