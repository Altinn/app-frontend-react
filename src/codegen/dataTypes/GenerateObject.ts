import { CodeGenerator } from 'src/codegen/CodeGenerator';

export interface Property<T extends CodeGenerator<any> = CodeGenerator<any>> {
  name: string;
  title?: string;
  description?: string;
  examples?: T extends CodeGenerator<infer V> ? V[] : never[];
  value: T;
}

export interface AddProperty extends Property {
  insertBefore?: string;
  insertAfter?: string;
}

export interface ObjectBaseDef {
  properties: Property[];
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

export class GenerateObject<T extends ObjectDef> extends CodeGenerator<T> {
  constructor(public config: T) {
    super();
  }

  public addProperty(prop: AddProperty): this {
    const { name } = prop;

    // Replace property if it already exists
    const index = this.config.properties.findIndex((property) => property.name === name);
    if (index !== -1) {
      this.config.properties[index] = prop;
      return this;
    }

    if (prop.insertBefore) {
      const index = this.config.properties.findIndex((property) => property.name === prop.insertBefore);
      if (index === -1) {
        throw new Error(`Property ${prop.insertBefore} not found`);
      }
      this.config.properties.splice(index, 0, prop);
      return this;
    }

    if (prop.insertAfter) {
      const index = this.config.properties.findIndex((property) => property.name === prop.insertAfter);
      if (index === -1) {
        throw new Error(`Property ${prop.insertAfter} not found`);
      }
      this.config.properties.splice(index + 1, 0, prop);
      return this;
    }

    this.config.properties.push(prop);
    return this;
  }

  public getProperty(name: string): Property | undefined {
    return this.config.properties.find((property) => property.name === name);
  }

  public toTypeScript(): string {
    const { name, inline, exported, properties } = this.config;

    if (!name && !inline) {
      throw new Error('Object name is required');
    }

    const propertyLines = properties.map((prop) => {
      if (prop.value.isOptional) {
        return `${prop.name}?: ${prop.value.toTypeScript()};`;
      } else {
        return `${prop.name}: ${prop.value.toTypeScript()};`;
      }
    });

    if (inline) {
      return `{ ${propertyLines.join('\n')} }`.trim();
    }

    return `${exported ? 'export ' : ''} interface ${name} { ${propertyLines.join('\n')} }`.trim();
  }
}
