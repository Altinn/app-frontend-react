import type { JSONSchema7Definition } from 'json-schema';

import { MaybeOptionalCodeGenerator } from 'src/codegen/CodeGenerator';
import { CodeGeneratorContext } from 'src/codegen/CodeGeneratorContext';

export interface ImportDef {
  import: string;
  from: string;
}

export class GenerateImportedSymbol<T> extends MaybeOptionalCodeGenerator<T> {
  public constructor(
    private readonly val: ImportDef,
    private readonly schemaSymbol?: string,
  ) {
    super();
  }

  toTypeScriptDefinition(symbol: string | undefined): string {
    CodeGeneratorContext.getInstance().addImport(this.val.import, this.val.from);
    return symbol ? `type ${symbol} = ${this.val.import};` : this.val.import;
  }

  toJsonSchema(): JSONSchema7Definition {
    if (this.schemaSymbol) {
      return { $ref: `#/definitions/${this.schemaSymbol}` };
    }

    throw new Error(`Cannot generate JsonSchema for imported '${this.val.import}'`);
  }
}
