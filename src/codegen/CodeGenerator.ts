import deepEqual from 'fast-deep-equal';
import type { JSONSchema7, JSONSchema7Type } from 'json-schema';

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
  public internal: InternalConfig<T> = {
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

  transformToResolved(): this | CodeGenerator<any> {
    return this;
  }

  containsExpressions(): boolean {
    try {
      const resolved = this.transformToResolved();
      return !deepEqual(resolved.toJsonSchema(), this.toJsonSchema());
    } catch (e) {
      // Something failed, possibly an exception when generating the JsonSchema. Assume it does not contain expressions.
      return false;
    }
  }

  abstract toJsonSchema(): JSONSchema7;
  abstract toTypeScript(): string;
}

export abstract class MaybeSymbolizedCodeGenerator<T> extends CodeGenerator<T> {
  exportAs(name: string): this {
    if (this.internal.symbol) {
      throw new Error('Cannot rename a symbolized code generator');
    }

    this.internal.symbol = {
      name,
      exported: true,
    };

    return this;
  }

  named(name: string): this {
    if (this.internal.symbol) {
      throw new Error('Cannot rename a symbolized code generator');
    }

    this.internal.symbol = {
      name,
      exported: false,
    };

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
