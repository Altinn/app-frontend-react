import { CodeGenerator } from 'src/codegen/CodeGenerator';

export class GenerateObject extends CodeGenerator {
  public name: string;
  public exported = false;
  public properties: { name: string; value: CodeGenerator }[] = [];

  constructor(public readonly inline?: boolean) {
    super();
  }

  public setName(name: string): this {
    this.name = name;
    return this;
  }

  public export(): this {
    this.exported = true;
    return this;
  }

  public addProperty(name: string, value: CodeGenerator): this {
    // Replace property if it already exists
    const index = this.properties.findIndex((property) => property.name === name);
    if (index !== -1) {
      this.properties[index].value = value;
      return this;
    }

    this.properties.push({ name, value });
    return this;
  }

  public addPropertyBefore(name: string, value: CodeGenerator, before: string): this {
    const index = this.properties.findIndex((property) => property.name === before);
    if (index === -1) {
      throw new Error(`Property ${before} not found`);
    }
    this.properties.splice(index, 0, { name, value });
    return this;
  }

  public addPropertyAfter(name: string, value: CodeGenerator, after: string): this {
    const index = this.properties.findIndex((property) => property.name === after);
    if (index === -1) {
      throw new Error(`Property ${after} not found`);
    }
    this.properties.splice(index + 1, 0, { name, value });
    return this;
  }

  public getProperty(name: string): CodeGenerator | undefined {
    const property = this.properties.find((property) => property.name === name);
    return property?.value;
  }

  public toTypeScript(): string {
    if (!this.name && !this.inline) {
      throw new Error('Object name is required');
    }

    const propertyLines = this.properties.map((property) => {
      if (property.value.isOptional) {
        return `${property.name}?: ${property.value.toTypeScript()};`;
      } else {
        return `${property.name}: ${property.value.toTypeScript()};`;
      }
    });

    if (this.inline) {
      return `{ ${propertyLines.join('\n')} }`.trim();
    }

    return `${this.exported ? 'export ' : ''} interface ${this.name} { ${propertyLines.join('\n')} }`.trim();
  }
}
