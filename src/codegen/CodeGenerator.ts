import type { JSONSchema7, JSONSchema7Type } from 'json-schema';

import { VariantSuffixes } from 'src/codegen/CG';
import { CodeGeneratorContext } from 'src/codegen/CodeGeneratorContext';
import type { Variant } from 'src/codegen/CG';

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

export interface Optionality<T> {
  default?: T;
  onlyIn?: Variant;
}

export interface InternalConfig<T> {
  jsonSchema: JsonSchemaExt<T>;
  typeScript: TypeScriptExt;
  symbol?: SymbolExt;
  optional: Optionality<T> | false;
  source?: CodeGenerator<any>;
}

export type Extract<Val extends CodeGenerator<any>> = Val extends CodeGenerator<infer X> ? X : never;

export abstract class CodeGenerator<T> {
  public currentVariant: Variant | undefined;
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
      default: this.internal.optional && (this.internal.optional.default as JSONSchema7Type),
    };
  }

  transformTo(variant: Variant): this | CodeGenerator<any> {
    const isImplementedLocally =
      this.containsVariationDifferences === CodeGenerator.prototype.containsVariationDifferences ||
      this.containsVariationDifferences === MaybeOptionalCodeGenerator.prototype.containsVariationDifferences;
    if (!this.currentVariant && this.containsVariationDifferences() && !isImplementedLocally) {
      throw new Error(
        'You need to implement transformTo for this code generator, as it contains variation differences',
      );
    }

    this.currentVariant = variant;
    return this;
  }

  containsVariationDifferences(): boolean {
    return this.internal.source?.containsVariationDifferences() || false;
  }

  abstract toJsonSchema(): JSONSchema7;
  abstract toTypeScript(): string;
}

export abstract class MaybeSymbolizedCodeGenerator<T> extends CodeGenerator<T> {
  exportAs(name: string): this {
    if (this.currentVariant) {
      throw new Error('You have to call exportAs() before calling transformTo()');
    }

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
    if (this.currentVariant) {
      throw new Error('You have to call named() before calling transformTo()');
    }

    if (this.internal.symbol) {
      throw new Error('Cannot rename a symbolized code generator');
    }

    this.internal.symbol = {
      name,
      exported: false,
    };

    return this;
  }

  getName(): string | undefined {
    if (!this.internal.symbol) {
      return undefined;
    }
    if (!this.currentVariant) {
      throw new Error('Cannot get name of symbolized code generator without variant - call transformTo() first');
    }
    if (this.containsVariationDifferences()) {
      return `${this.internal.symbol?.name}${VariantSuffixes[this.currentVariant]}`;
    }

    return this.internal.symbol?.name;
  }

  private shouldBeExported(): boolean {
    return this.internal.symbol?.exported ?? false;
  }

  transformTo(variant: Variant): this | MaybeSymbolizedCodeGenerator<any> {
    return super.transformTo(variant) as this | MaybeSymbolizedCodeGenerator<any>;
  }

  toTypeScript(): string {
    if (!this.currentVariant) {
      throw new Error('You need to transform this type to either external or internal before generating TypeScript');
    }

    const name = this.getName();
    if (name) {
      CodeGeneratorContext.curFile().addSymbol(name, this.shouldBeExported(), this);

      // If this type has a symbol, always use the symbol name
      // as a reference instead of the full type definition
      return name;
    }

    return this.toTypeScriptDefinition(undefined);
  }

  abstract toTypeScriptDefinition(symbol: string | undefined): string;
}

export abstract class MaybeOptionalCodeGenerator<T> extends MaybeSymbolizedCodeGenerator<T> {
  optional(optionality?: Optionality<T>): this {
    this.internal.optional = optionality || {};
    return this;
  }

  isOptional(): boolean {
    const isOptional = this.internal.optional !== false;
    const onlyIn = this.internal.optional && this.internal.optional.onlyIn;
    const matchesCurrentVariant = !onlyIn || onlyIn === this.currentVariant;
    return isOptional && matchesCurrentVariant;
  }

  containsVariationDifferences(): boolean {
    const optionalIn = this.internal.optional !== false ? this.internal.optional.onlyIn : undefined;
    return super.containsVariationDifferences() || optionalIn !== undefined;
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

export interface CodeGeneratorWithProperties {
  hasProperty(name: string): boolean;
  getProperty(name: string): CodeGenerator<any> | undefined;
  getProperties(): CodeGenerator<any>[];
}
