import type { JSONSchema7 } from 'json-schema';

import { MaybeOptionalCodeGenerator } from 'src/codegen/CodeGenerator';
import { CodeGeneratorContext } from 'src/codegen/CodeGeneratorContext';

export interface ImportDef {
  import: string;
  from: string;
}

export class GenerateImportedSymbol<T> extends MaybeOptionalCodeGenerator<T> {
  public constructor(private readonly val: ImportDef) {
    super();
  }

  toTypeScriptDefinition(symbol: string | undefined): string {
    CodeGeneratorContext.getInstance().addImport(this.val.import, this.val.from);
    return symbol ? `type ${symbol} = ${this.val.import};` : this.val.import;
  }

  toJsonSchema(): JSONSchema7 {
    throw new Error(`Cannot generate JsonSchema for imported '${this.val.import}'`);
  }
}
