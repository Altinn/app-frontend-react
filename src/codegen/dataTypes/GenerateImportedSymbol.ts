import type { JSONSchema7, JSONSchema7Definition } from 'json-schema';

import { DescribableCodeGenerator } from 'src/codegen/CodeGenerator';
import { CodeGeneratorContext } from 'src/codegen/CodeGeneratorContext';

export interface ImportDef {
  import: string;
  from: string;
  jsonSchema: JSONSchema7 | JSONSchema7Definition | null;
}

export class GenerateImportedSymbol<T> extends DescribableCodeGenerator<T> {
  public constructor(private readonly val: ImportDef) {
    super();
  }

  toTypeScript(): string {
    CodeGeneratorContext.getInstance().addImport(this.val.import, this.val.from);
    return this.val.import;
  }

  toJsonSchema(): JSONSchema7Definition {
    if (this.val.jsonSchema === null) {
      throw new Error('Cannot generate JsonSchema for imported symbol');
    }

    return {
      ...this.getInternalJsonSchema(),
      ...(this.val.jsonSchema as JSONSchema7),
    };
  }
}
