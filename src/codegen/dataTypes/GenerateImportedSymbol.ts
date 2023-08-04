import type { JSONSchema7 } from 'json-schema';

import { Variant } from 'src/codegen/CG';
import { MaybeOptionalCodeGenerator } from 'src/codegen/CodeGenerator';
import { CodeGeneratorContext } from 'src/codegen/CodeGeneratorContext';

export interface ImportDef {
  import: string;
  from: string;
}

/**
 * Generates a plain import statement in TypeScript. Beware that if you use this in code generating a JsonSchema,
 * your code will fail (JsonSchema only supports imports from the definitions, i.e. 'common' imports).
 */
export class GenerateImportedSymbol<T> extends MaybeOptionalCodeGenerator<T> {
  public constructor(private readonly val: ImportDef) {
    super();
  }

  transformTo(variant: Variant): this | GenerateImportedSymbol<any> {
    if (variant === Variant.External) {
      throw new Error('Cannot generate external imports');
    }

    this.currentVariant = variant;
    return this;
  }

  toTypeScriptDefinition(symbol: string | undefined): string {
    if (symbol) {
      throw new Error('Do not re-define imported symbols');
    }

    CodeGeneratorContext.curFile().addImport(this.val.import, this.val.from);
    return this.val.import;
  }

  toJsonSchema(): JSONSchema7 {
    throw new Error(`Cannot generate JsonSchema for imported '${this.val.import}'`);
  }

  containsVariationDifferences(): boolean {
    return this.internal.source?.containsVariationDifferences() || false;
  }
}
