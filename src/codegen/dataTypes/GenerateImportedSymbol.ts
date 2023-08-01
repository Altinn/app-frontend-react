import type { JSONSchema7 } from 'json-schema';

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

  transformToResolved(): this | GenerateImportedSymbol<any> {
    return this;
  }

  _toTypeScriptDefinition(symbol: string | undefined): string {
    CodeGeneratorContext.getFileInstance().addImport(this.val.import, this.val.from);
    return symbol ? `type ${symbol} = ${this.val.import};` : this.val.import;
  }

  toJsonSchema(): JSONSchema7 {
    throw new Error(`Cannot generate JsonSchema for imported '${this.val.import}'`);
  }
}
