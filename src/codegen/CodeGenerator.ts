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
    return false;
  }

  abstract toJsonSchema(): JSONSchema7;
  abstract _toTypeScript(): string;

  toTypeScript(variant: 'resolved' | 'unresolved'): string {
    return CodeGeneratorContext.generateTypeScript(() => {
      if (variant === 'resolved') {
        return this.transformToResolved()._toTypeScript();
      }

      return this._toTypeScript();
    }, variant).result;
  }
}

export abstract class MaybeSymbolizedCodeGenerator<T> extends CodeGenerator<T> {
  exportAs(name: string, allowRename = false): this {
    if (this.internal.symbol && !allowRename) {
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

  _toTypeScript(): string {
    if (this.internal.symbol) {
      if (this.containsExpressions() && !this.internal.symbol.name.match(/(Unresolved|Resolved)$/)) {
        const unresolvedSymbol: SymbolExt = {
          name: `${this.internal.symbol.name}Unresolved`,
          exported: this.internal.symbol.exported,
        };
        const resolvedSymbol: SymbolExt = {
          name: `${this.internal.symbol.name}Resolved`,
          exported: this.internal.symbol.exported,
        };
        CodeGeneratorContext.getFileInstance().addSymbol(unresolvedSymbol, this);
        const resolved = this.transformToResolved();
        CodeGeneratorContext.getFileInstance().addSymbol(resolvedSymbol, resolved as MaybeSymbolizedCodeGenerator<any>);

        // PRIORITY: Figure out if the current context is resolved or unresolved
        return unresolvedSymbol.name;
      }

      CodeGeneratorContext.getFileInstance().addSymbol(this.internal.symbol, this);
      // If this type has a symbol, always use the symbol name instead of the full type definition
      return this.internal.symbol.name;
    }

    return this._toTypeScriptDefinition(undefined);
  }

  abstract _toTypeScriptDefinition(symbol: string | undefined): string;
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
