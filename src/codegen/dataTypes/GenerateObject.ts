import { CodeGenerator } from 'src/codegen/CodeGenerator';

export interface Property {
  name: string;
  title?: string;
  description?: string;
  value: CodeGenerator;
}

export interface AddProperty extends Property {
  insertBefore?: string;
  insertAfter?: string;
}

export class GenerateObject extends CodeGenerator {
  public name: string;
  public exported = false;
  public properties: Property[] = [];

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

  public addProperty(prop: AddProperty): this {
    const { name } = prop;

    // Replace property if it already exists
    const index = this.properties.findIndex((property) => property.name === name);
    if (index !== -1) {
      this.properties[index] = prop;
      return this;
    }

    if (prop.insertBefore) {
      const index = this.properties.findIndex((property) => property.name === prop.insertBefore);
      if (index === -1) {
        throw new Error(`Property ${prop.insertBefore} not found`);
      }
      this.properties.splice(index, 0, prop);
      return this;
    }

    if (prop.insertAfter) {
      const index = this.properties.findIndex((property) => property.name === prop.insertAfter);
      if (index === -1) {
        throw new Error(`Property ${prop.insertAfter} not found`);
      }
      this.properties.splice(index + 1, 0, prop);
      return this;
    }

    this.properties.push(prop);
    return this;
  }

  public getProperty(name: string): Property | undefined {
    return this.properties.find((property) => property.name === name);
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
