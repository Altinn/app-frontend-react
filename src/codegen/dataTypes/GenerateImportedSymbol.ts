import { CodeGenerator } from 'src/codegen/CodeGenerator';
import { CodeGeneratorContext } from 'src/codegen/CodeGeneratorContext';

export interface ImportDef {
  symbol: string;
  importSymbol?: string;
  importFrom: string;
}

export class GenerateImportedSymbol extends CodeGenerator {
  public constructor(private readonly val: ImportDef) {
    super();
  }

  toTypeScript(): string {
    const importSymbol = this.val.importSymbol ?? this.val.symbol;
    CodeGeneratorContext.getInstance().addImport(importSymbol, this.val.importFrom);
    return this.val.symbol;
  }
}
