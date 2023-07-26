import type { JSONSchema7Definition } from 'json-schema';

import { DescribableCodeGenerator } from 'src/codegen/CodeGenerator';
import { CodeGeneratorContext } from 'src/codegen/CodeGeneratorContext';

export interface ImportDef {
  symbol: string;
  importSymbol?: string;
  importFrom: string;
}

export class GenerateImportedSymbol<T> extends DescribableCodeGenerator<T> {
  public constructor(private readonly val: ImportDef) {
    super();
  }

  toTypeScript(): string {
    const importSymbol = this.val.importSymbol ?? this.val.symbol;
    CodeGeneratorContext.getInstance().addImport(importSymbol, this.val.importFrom);
    return this.val.symbol;
  }

  toJsonSchema(): JSONSchema7Definition {
    return {
      ...this.getInternalJsonSchema(),

      // TODO: Implement proper references
      $ref: `#/definitions/${this.val.symbol}`,
    };
  }
}
