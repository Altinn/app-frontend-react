import type { JSONSchema7, JSONSchema7Definition, JSONSchema7Type } from 'json-schema';

import { CodeGeneratorContext } from 'src/codegen/CodeGeneratorContext';

export interface JsonSchemaExt<T> {
  title: string | undefined;
  description: string | undefined;
  examples: T[];
}

export interface TypeScriptExt {}

export interface SymbolExt {
  name: string;
  exported: boolean;
}

export interface InternalConfig<T> {
  jsonSchema: JsonSchemaExt<T>;
  typeScript: TypeScriptExt;
  symbol?: SymbolExt;
  optional: boolean;
  default?: T;
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

  protected getInternalJsonSchema(): JSONSchema7 {
    return {
      title: this.internal.jsonSchema.title,
      description: this.internal.jsonSchema.description,
      examples: this.internal.jsonSchema.examples.length ? (this.internal.jsonSchema.examples as any) : undefined,
      default: this.internal.default as JSONSchema7Type,
    };
  }

  abstract toJsonSchema(): JSONSchema7Definition;
  abstract toTypeScript(): string;
}

export abstract class MaybeSymbolizedCodeGenerator<T> extends CodeGenerator<T> {
  setSymbol(symbol: SymbolExt): this {
    this.internal.symbol = symbol;

    return this;
  }

  getSymbol(): SymbolExt | undefined {
    return this.internal.symbol;
  }

  toTypeScript(): string {
    if (this.internal.symbol) {
      // If this type has a symbol, always use the symbol name instead of the full type definition
      CodeGeneratorContext.getInstance().addSymbol(this);
      return this.internal.symbol.name;
    }

    return this.toTypeScriptDefinition(undefined);
  }

  abstract toTypeScriptDefinition(symbol: string | undefined): string;
}

export abstract class MaybeOptionalCodeGenerator<T> extends MaybeSymbolizedCodeGenerator<T> {
  optional(defaultValue?: T): this {
    this.internal.optional = true;
    this.internal.default = defaultValue;
    return this;
  }
}

export abstract class DescribableCodeGenerator<T> extends MaybeOptionalCodeGenerator<T> {
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
