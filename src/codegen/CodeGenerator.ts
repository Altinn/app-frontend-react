export interface JsonSchemaExt<T> {
  title: string | undefined;
  description: string | undefined;
  examples: T[];
}

export interface TypeScriptExt {}

export interface InternalConfig<T> {
  jsonSchema: JsonSchemaExt<T>;
  typeScript: TypeScriptExt;
  optional: boolean;
  default?: CodeGenerator<T>;
}

export abstract class CodeGenerator<T> {
  public readonly internal: InternalConfig<T> = {
    jsonSchema: {
      title: undefined,
      description: undefined,
      examples: [],
    },
    typeScript: {},
    optional: false,
  };

  optional(defaultValue?: CodeGenerator<T>): this {
    this.internal.optional = true;
    this.internal.default = defaultValue;
    return this;
  }

  abstract toTypeScript(): string;
}

export abstract class DescribableCodeGenerator<T> extends CodeGenerator<T> {
  setTitle(title: string): this {
    this.internal.jsonSchema.title = title;
    return this;
  }

  setDescription(description: string): this {
    this.internal.jsonSchema.description = description;
    return this;
  }

  addExample(...examples: T[]): this {
    this.internal.jsonSchema.examples.push(...examples);
    return this;
  }
}
