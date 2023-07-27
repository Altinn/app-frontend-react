import type { MaybeSymbolizedCodeGenerator } from 'src/codegen/CodeGenerator';

/**
 * This code relies on the fact that the code generator will generate one file at a time, and reset the context
 * between each file. This means that we can use a global variable to store the context, and use this context
 * to store information about the current file being generated (such as imports, etc).
 */
export class CodeGeneratorContext {
  private static instance: CodeGeneratorContext | undefined;
  private readonly targetFile: string;

  private constructor(targetFile: string) {
    this.targetFile = targetFile.replace(/\.ts$/, '');
  }

  public static getInstance(): CodeGeneratorContext {
    if (!this.instance) {
      throw new Error(
        'CodeGeneratorContext has not been initialized, run this in code that is called ' +
          'within CodeGeneratorContext.run(), such as a CodeGenerator.toTypeScript() method',
      );
    }

    return this.instance;
  }

  public static run(targetFile: string, fn: () => string): { result: string } {
    const instance = new CodeGeneratorContext(targetFile);
    CodeGeneratorContext.instance = instance;
    const out = fn();
    const parts: string[] = [out];
    while (Object.keys(instance.symbols).length) {
      parts.unshift(instance.getSymbolsAsTypeScript());
    }
    while (Object.keys(instance.imports).length) {
      parts.unshift(instance.getImportsAsTypeScript());
    }
    CodeGeneratorContext.instance = undefined;

    return { result: parts.join('\n\n') };
  }

  private imports: { [fileName: string]: Set<string> } = {};
  private symbols: { [symbol: string]: MaybeSymbolizedCodeGenerator<any> } = {};

  public addImport(symbol: string, from: string): void {
    if (from === this.targetFile) {
      return;
    }

    if (!this.imports[from]) {
      this.imports[from] = new Set();
    }

    const set = this.imports[from] as Set<string>;
    set.add(symbol);
  }

  public addSymbol(generator: MaybeSymbolizedCodeGenerator<any>) {
    const symbol = generator.getSymbol();
    if (!symbol) {
      throw new Error('Cannot add a symbol without a name');
    }
    this.symbols[symbol.name] = generator;
  }

  private getImportsAsTypeScript(): string {
    const importLines = Object.keys(this.imports).map((fileName) => {
      const symbols = Array.from(this.imports[fileName]).sort();
      return `import { ${symbols.join(', ')} } from '${fileName}';`;
    });

    this.imports = {};
    return importLines.join('\n');
  }

  private getSymbolsAsTypeScript(): string {
    return Object.keys(this.symbols)
      .map((name) => {
        const sym = this.symbols[name];
        const symbol = sym.getSymbol();
        if (!symbol) {
          throw new Error('Cannot get symbol without a name');
        }

        delete this.symbols[name];
        const out = sym.toTypeScriptDefinition(symbol.name);
        return symbol.exported ? `export ${out}` : out;
      })
      .join('\n\n');
  }
}
