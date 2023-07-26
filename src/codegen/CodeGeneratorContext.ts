import type { MaybeSymbolizedCodeGenerator } from 'src/codegen/CodeGenerator';

/**
 * This code relies on the fact that the code generator will generate one file at a time, and reset the context
 * between each file. This means that we can use a global variable to store the context, and use this context
 * to store information about the current file being generated (such as imports, etc).
 */
export class CodeGeneratorContext {
  private static instance: CodeGeneratorContext;

  public static getInstance(): CodeGeneratorContext {
    if (!this.instance) {
      this.instance = new CodeGeneratorContext();
    }

    return this.instance;
  }

  private files: { [fileName: string]: Set<string> } = {};
  private symbols: { [symbol: string]: MaybeSymbolizedCodeGenerator<any> } = {};

  public addImport(symbol: string, from: string): void {
    const set = this.files[from] ? this.files[from] : (this.files[from] = new Set());
    set.add(symbol);
  }

  public addSymbol(generator: MaybeSymbolizedCodeGenerator<any>) {
    const symbol = generator.getSymbol();
    if (!symbol) {
      throw new Error('Cannot add a symbol without a name');
    }
    this.symbols[symbol.name] = generator;
  }

  public getImports() {
    return this.files;
  }

  public getSymbols() {
    return this.symbols;
  }

  public getImportsAsTypeScript(): string {
    const imports = this.getImports();
    const importLines = Object.keys(imports).map((fileName) => {
      const symbols = Array.from(imports[fileName]).sort();
      return `import { ${symbols.join(', ')} } from '${fileName}';`;
    });

    return importLines.join('\n');
  }

  public getSymbolsAsTypeScript(): string {
    const symbols = this.getSymbols();
    return Object.values(symbols)
      .map((sym) => {
        const symbol = sym.getSymbol();
        if (!symbol) {
          throw new Error('Cannot get symbol without a name');
        }

        const out = sym.toTypeScriptDefinition(symbol.name);
        return symbol.exported ? `export ${out}` : out;
      })
      .join('\n\n');
  }

  public reset(): void {
    this.files = {};
  }
}
