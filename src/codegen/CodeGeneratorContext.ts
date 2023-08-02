import type { MaybeSymbolizedCodeGenerator } from 'src/codegen/CodeGenerator';

/**
 * This code relies on the fact that the code generator will generate one file at a time, and reset the context
 * between each file. This means that we can use a global variable to store the context, and use this context
 * to store information about the current file being generated (such as imports, etc).
 */
export class CodeGeneratorContext {
  private static fileInstance: CodeGeneratorFileContext | undefined;

  public static curFile(): CodeGeneratorFileContext {
    if (!this.fileInstance) {
      throw new Error(
        'CodeGeneratorFileContext has not been initialized, run this in code that is called ' +
          'within CodeGeneratorContext.generateFile(), such as a CodeGenerator.toTypeScript() method',
      );
    }

    return this.fileInstance;
  }

  public static async generateFile(
    targetFile: string,
    fn: () => string | Promise<string>,
  ): Promise<{ result: string }> {
    const instance = new CodeGeneratorFileContext(targetFile);
    CodeGeneratorContext.fileInstance = instance;
    const functionOutput = await fn();
    const parts: string[] = [];
    const symbols: { [symbol: string]: string } = {};
    while (Object.keys(instance.symbols).length) {
      const newSymbols = instance.getSymbolsAsTypeScript(symbols);
      Object.assign(symbols, newSymbols);
    }

    // Sort symbols and add them in sorted order to the file
    const sortedSymbols = Object.keys(symbols).sort();
    for (const symbol of sortedSymbols) {
      parts.push(symbols[symbol]);
    }

    while (Object.keys(instance.imports).length) {
      parts.unshift(instance.getImportsAsTypeScript());
    }

    if (functionOutput) {
      parts.push(functionOutput);
    }

    CodeGeneratorContext.fileInstance = undefined;

    return { result: parts.join('\n\n') };
  }
}

type Imports = { [fileName: string]: Set<string> };

export class CodeGeneratorFileContext {
  private readonly targetFile: string;
  public symbols: { [symbol: string]: string } = {};
  public imports: Imports = {};

  constructor(targetFile: string) {
    this.targetFile = targetFile.replace(/\.ts$/, '');
  }

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

  public addSymbol(name: string, exported: boolean, generator: MaybeSymbolizedCodeGenerator<any>) {
    const prefix = exported ? 'export ' : '';
    const definition = prefix + generator.toTypeScriptDefinition(name);
    if (this.symbols[name] && this.symbols[name] !== definition) {
      throw new Error(`Symbol ${name} already exists, and is not equal to the new symbol`);
    }

    this.symbols[name] = definition;
  }

  getImportsAsTypeScript(): string {
    const importLines = Object.keys(this.imports).map((fileName) => {
      const symbols = Array.from(this.imports[fileName]).sort();
      return `import { ${symbols.join(', ')} } from '${fileName}';`;
    });

    this.imports = {};
    return importLines.join('\n');
  }

  getSymbolsAsTypeScript(ifNotIn: { [symbol: string]: string }): { [symbol: string]: string } {
    const out: { [symbol: string]: string } = {};

    for (const name of Object.keys(this.symbols)) {
      if (ifNotIn[name]) {
        continue;
      }
      out[name] = this.symbols[name];
    }

    this.symbols = {};
    return out;
  }
}
