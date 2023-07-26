import { DescribableCodeGenerator } from 'src/codegen/CodeGenerator';
import type { GenerateProperty } from 'src/codegen/dataTypes/GenerateProperty';

export interface ObjectBaseDef {
  properties: GenerateProperty<any>[];
}

export interface ExportedNamedObject extends ObjectBaseDef {
  name: string;
  exported: true;
  inline?: false;
}

export interface NamedObject extends ObjectBaseDef {
  name: string;
  exported?: false;
  inline: false;
}

export interface InlineObject extends ObjectBaseDef {
  name?: undefined;
  exported?: false;
  inline: true;
}

export type ObjectDef = ExportedNamedObject | NamedObject | InlineObject;

export class GenerateObject<T extends ObjectDef> extends DescribableCodeGenerator<T> {
  constructor(public config: T) {
    super();
  }

  public addProperty(prop: GenerateProperty<any>): this {
    const { name, insertBefore, insertAfter } = prop.toObject();

    // Replace property if it already exists
    const index = this.config.properties.findIndex((property) => property.name === name);
    if (index !== -1) {
      this.config.properties[index] = prop;
      return this;
    }

    if (insertBefore) {
      const index = this.config.properties.findIndex((property) => property.name === insertBefore);
      if (index === -1) {
        throw new Error(`Property ${insertBefore} not found`);
      }
      this.config.properties.splice(index, 0, prop);
      return this;
    }

    if (insertAfter) {
      const index = this.config.properties.findIndex((property) => property.name === insertAfter);
      if (index === -1) {
        throw new Error(`Property ${insertAfter} not found`);
      }
      this.config.properties.splice(index + 1, 0, prop);
      return this;
    }

    this.config.properties.push(prop);
    return this;
  }

  public getProperty(name: string): GenerateProperty<any> | undefined {
    return this.config.properties.find((property) => property.name === name);
  }

  public toTypeScript(): string {
    const { name, inline, exported } = this.config;

    if (!name && !inline) {
      throw new Error('Object name is required');
    }

    const properties = this.config.properties.map((prop) => prop.toTypeScript()).join('\n');
    if (inline) {
      return `{ ${properties} }`;
    }

    return `${exported ? 'export ' : ''} interface ${name} { ${properties} }`;
  }
}
