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

  public addImport(symbol: string, fromFile: string): void {
    const set = this.files[fromFile] ? this.files[fromFile] : (this.files[fromFile] = new Set());
    set.add(symbol);
  }

  public getImports() {
    return this.files;
  }

  public getImportsAsTypeScript(): string {
    const imports = this.getImports();
    const importLines = Object.keys(imports).map((fileName) => {
      const symbols = Array.from(imports[fileName]).sort();
      return `import { ${symbols.join(', ')} } from '${fileName}';`;
    });

    return importLines.join('\n');
  }

  public reset(): void {
    this.files = {};
  }
}
