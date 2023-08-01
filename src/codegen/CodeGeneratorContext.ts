import type { MaybeSymbolizedCodeGenerator, SymbolExt } from 'src/codegen/CodeGenerator';

/**
 * This code relies on the fact that the code generator will generate one file at a time, and reset the context
 * between each file. This means that we can use a global variable to store the context, and use this context
 * to store information about the current file being generated (such as imports, etc).
 */
export class CodeGeneratorContext {
  private static fileInstance: CodeGeneratorFileContext | undefined;
  private static typeScriptInstance: CodeGeneratorTypeScriptContext | undefined;

  public static getFileInstance(): CodeGeneratorFileContext {
    if (!this.fileInstance) {
      throw new Error(
        'CodeGeneratorFileContext has not been initialized, run this in code that is called ' +
          'within CodeGeneratorContext.generateFile(), such as a CodeGenerator.toTypeScript() method',
      );
    }

    return this.fileInstance;
  }

  public static getTypeScriptInstance(): CodeGeneratorTypeScriptContext {
    if (!this.typeScriptInstance) {
      throw new Error(
        'CodeGeneratorTypeScriptContext has not been initialized, run this in code that is called ' +
          'within CodeGeneratorContext.generateTypeScript(), such as a CodeGenerator.toTypeScript() method',
      );
    }

    return this.typeScriptInstance;
  }

  public static async generateFile(
    targetFile: string,
    fn: () => string | Promise<string>,
  ): Promise<{ result: string }> {
    const instance = new CodeGeneratorFileContext(targetFile);
    CodeGeneratorContext.fileInstance = instance;
    const out = await fn();
    const parts: string[] = [out];
    const symbols = new Set<string>();
    while (Object.keys(instance.symbols).length) {
      parts.unshift(instance.getSymbolsAsTypeScript(symbols));
    }
    while (Object.keys(instance.imports).length) {
      parts.unshift(instance.getImportsAsTypeScript());
    }
    CodeGeneratorContext.fileInstance = undefined;

    return { result: parts.join('\n\n') };
  }

  public static generateTypeScript(fn: () => string, variant: Variant): { result: string } {
    if (!this.fileInstance) {
      throw new Error(
        'CodeGeneratorFileContext has not been initialized, run this in code that is called ' +
          'within CodeGeneratorContext.generateFile()',
      );
    }

    CodeGeneratorContext.typeScriptInstance = new CodeGeneratorTypeScriptContext(variant);
    const out = fn();
    CodeGeneratorContext.typeScriptInstance = undefined;

    return { result: out };
  }
}

type Imports = { [fileName: string]: Set<string> };

export class CodeGeneratorFileContext {
  private readonly targetFile: string;
  public readonly symbols: { [symbol: string]: string } = {};
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

  public addSymbol(symbol: SymbolExt, generator: MaybeSymbolizedCodeGenerator<any>) {
    const prefix = symbol.exported ? 'export ' : '';
    const definition = prefix + generator._toTypeScriptDefinition(symbol.name);
    if (this.symbols[symbol.name] && this.symbols[symbol.name] !== definition) {
      throw new Error(`Symbol ${symbol.name} already exists, and is not equal to the new symbol`);
    }

    this.symbols[symbol.name] = definition;
  }

  getImportsAsTypeScript(): string {
    const importLines = Object.keys(this.imports).map((fileName) => {
      const symbols = Array.from(this.imports[fileName]).sort();
      return `import { ${symbols.join(', ')} } from '${fileName}';`;
    });

    this.imports = {};
    return importLines.join('\n');
  }

  getSymbolsAsTypeScript(ifNotIn: Set<string>): string {
    return Object.keys(this.symbols)
      .filter((name) => !ifNotIn.has(name))
      .map((name) => {
        const definition = this.symbols[name];
        ifNotIn.add(name);
        delete this.symbols[name];
        return definition;
      })
      .join('\n\n');
  }
}

export enum Variant {
  Internal = 'internal',
  External = 'external',
}

export const VariantSuffixes: { [variant in Variant]: string } = {
  [Variant.Internal]: 'Internal',
  [Variant.External]: 'External',
};

export class CodeGeneratorTypeScriptContext {
  constructor(public readonly variant: Variant) {}
}
