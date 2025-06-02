import type { JSONSchema7, JSONSchema7Type } from 'json-schema';

import { CodeGeneratorContext } from 'src/codegen/CodeGeneratorContext';
import type { GenerateProperty } from 'src/codegen/dataTypes/GenerateProperty';
import type { ComponentProperty, PropBase, PropLink } from 'src/codegen/types';

export interface JsonSchemaExt<T> {
  title: string | undefined;
  description: string | undefined;
  examples: T[];
  deprecated: boolean | undefined;
  deprecationWarning: string | undefined;
}

export interface TypeScriptExt {
  comment?: string;
}

export interface SymbolExt {
  name: string;
  exported: boolean;
}

export interface Optionality<T> {
  default?: T;
}

export interface InternalConfig<T> {
  jsonSchema: JsonSchemaExt<T>;
  typeScript: TypeScriptExt;
  symbol?: SymbolExt;
  optional: Optionality<T> | false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  source?: CodeGenerator<any>;
  frozen: false | string;
  docsLink: string | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Extract<Val extends CodeGenerator<any>> = Val extends CodeGenerator<infer X> ? X : never;

export abstract class CodeGenerator<T> {
  public internal: InternalConfig<T> = {
    jsonSchema: {
      title: undefined,
      description: undefined,
      examples: [],
      deprecated: undefined,
      deprecationWarning: undefined,
    },
    typeScript: {},
    optional: false,
    frozen: false,
    docsLink: undefined,
  };

  /**
   * Gets the schemas description, and prepends a deprecation warning if the property is deprecated
   */
  private getSchemaDescription(): string | undefined {
    const description = this.internal.jsonSchema.description;
    if (this.internal.jsonSchema.deprecated) {
      const deprecationMessage = `**Deprecated**: ${this.internal.jsonSchema.deprecationWarning}`;
      return description ? [deprecationMessage, description].join('\n') : deprecationMessage;
    }
    return description;
  }

  protected getInternalJsonSchema(): JSONSchema7 {
    this.freeze('getInternalJsonSchema');
    return {
      title: this.internal.jsonSchema.title || this.internal.symbol?.name || undefined,
      description: this.getSchemaDescription(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      examples: this.internal.jsonSchema.examples.length ? (this.internal.jsonSchema.examples as any) : undefined,
      default: this.internal.optional ? (this.internal.optional.default as JSONSchema7Type) : undefined,
      // @ts-expect-error Although not included in JSON schema version 7, this is implemented in more recent versions, and works in VS Code
      deprecated: this.internal.jsonSchema.deprecated,
    };
  }

  protected getInternalPropList(): PropBase | PropLink {
    this.freeze('getInternalPropList');

    if (this.internal.docsLink) {
      // TODO: Verifiy that this link is valid
      return { type: 'link', link: this.internal.docsLink };
    }

    return {
      title: this.internal.jsonSchema.title,
      description: this.getSchemaDescription(),
      examples: this.internal.jsonSchema.examples.length ? this.internal.jsonSchema.examples : undefined,
      default: this.internal.optional ? (this.internal.optional.default as JSONSchema7Type) : undefined,
      deprecated: this.internal.jsonSchema.deprecated,
    };
  }

  protected ensureMutable(): void {
    if (this.internal.frozen !== false) {
      throw new Error(`Cannot modify frozen code generator (was frozen by ${this.internal.frozen})`);
    }
  }

  protected freeze(source: string): void {
    this.internal.frozen = source;
  }

  shouldUseParens(): boolean {
    return false;
  }

  abstract toJsonSchema(): JSONSchema7;
  abstract toTypeScript(): string;
  abstract toPropList(): ComponentProperty;

  linkToDocs(link: string): this {
    this.internal.docsLink = link;
    return this;
  }

  hasLinkToDocs(): boolean {
    return this.internal.docsLink !== undefined;
  }
}

export abstract class MaybeSymbolizedCodeGenerator<T> extends CodeGenerator<T> {
  exportAs(name: string): this {
    this.ensureMutable();
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
    this.ensureMutable();
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

    return this.internal.symbol?.name;
  }

  toString(): string {
    return this.toTypeScript();
  }

  private shouldBeExported(): boolean {
    return this.internal.symbol?.exported ?? false;
  }

  toTypeScript(): string {
    this.freeze('toTypeScript');

    const name = this.getName();
    if (name) {
      CodeGeneratorContext.curFile().addSymbol(name, this.shouldBeExported(), this);

      // If this type has a symbol, always use the symbol name
      // as a reference instead of the full type definition
      return name;
    }

    return this.toTypeScriptDefinition(undefined);
  }

  toJsonSchema(): JSONSchema7 {
    this.freeze('toJsonSchema');

    const name = this.getName();
    if (name) {
      CodeGeneratorContext.curFile().addSymbol(name, this.shouldBeExported(), this);

      // If this type has a symbol, always use the symbol name
      // as a reference instead of the full type definition
      return { $ref: `#/definitions/${name}` };
    }

    return this.toJsonSchemaDefinition();
  }

  toPropList(): ComponentProperty {
    this.freeze('toPropList');
    if (this.hasLinkToDocs()) {
      return this.getInternalPropList() as PropLink;
    }

    return this.toPropListDefinition();
  }

  canBeFlattened(): boolean {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toFlattened(_prefix: string = ''): GenerateProperty<any>[] {
    throw new Error('Cannot flatten this');
  }

  abstract toJsonSchemaDefinition(): JSONSchema7;

  abstract toTypeScriptDefinition(symbol: string | undefined): string;

  abstract toPropListDefinition(): ComponentProperty;
}

export abstract class MaybeOptionalCodeGenerator<T> extends MaybeSymbolizedCodeGenerator<T> {
  optional(optionality?: Optionality<T>): this {
    this.ensureMutable();
    this.internal.optional = optionality || {};
    return this;
  }

  isOptional(): boolean {
    return this.internal.optional !== false;
  }
}

export abstract class DescribableCodeGenerator<T> extends MaybeOptionalCodeGenerator<T> {
  setDeprecated(warning: string): this {
    this.ensureMutable();
    this.internal.jsonSchema.deprecated = true;
    this.internal.jsonSchema.deprecationWarning = warning;
    return this;
  }

  setTitle(title: string): this {
    this.ensureMutable();
    this.internal.jsonSchema.title = title;
    return this;
  }

  setDescription(description: string): this {
    this.ensureMutable();
    this.internal.jsonSchema.description = description;
    return this;
  }

  addExample(...examples: T[]): this {
    this.ensureMutable();
    this.internal.jsonSchema.examples.push(...examples);
    return this;
  }

  setTsComment(comment: string): this {
    this.ensureMutable();
    this.internal.typeScript.comment = comment;
    return this;
  }
}

export interface CodeGeneratorWithProperties {
  hasProperty(name: string): boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getProperty(name: string): CodeGenerator<any> | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getProperties(): CodeGenerator<any>[];
}
