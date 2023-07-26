import type { JSONSchema7Definition } from 'json-schema';

import { DescribableCodeGenerator } from 'src/codegen/CodeGenerator';
import type { CodeGenerator } from 'src/codegen/CodeGenerator';
import type { GenerateProperty } from 'src/codegen/dataTypes/GenerateProperty';

export type Props = GenerateProperty<any>[];
export type AsInterface<P extends Props> = {
  [K in P[number]['name']]: P[number]['type'] extends CodeGenerator<infer X> ? X : never;
};

export class GenerateObject<P extends Props> extends DescribableCodeGenerator<AsInterface<P>> {
  private readonly properties: P;
  private _additionalProperties: DescribableCodeGenerator<any> | false = false;

  constructor(...properties: P) {
    super();
    this.properties = properties;
  }

  additionalProperties(type: DescribableCodeGenerator<any> | false) {
    this._additionalProperties = type;
    return this;
  }

  addProperty(prop: GenerateProperty<any>): this {
    const { name, insertBefore, insertAfter } = prop.toObject();

    // Replace property if it already exists
    const index = this.properties.findIndex((property) => property.name === name);
    if (index !== -1) {
      this.properties[index] = prop;
      return this;
    }

    if (insertBefore) {
      const index = this.properties.findIndex((property) => property.name === insertBefore);
      if (index === -1) {
        throw new Error(`Property ${insertBefore} not found`);
      }
      this.properties.splice(index, 0, prop);
      return this;
    }

    if (insertAfter) {
      const index = this.properties.findIndex((property) => property.name === insertAfter);
      if (index === -1) {
        throw new Error(`Property ${insertAfter} not found`);
      }
      this.properties.splice(index + 1, 0, prop);
      return this;
    }

    this.properties.push(prop);
    return this;
  }

  getProperty(name: string): GenerateProperty<any> | undefined {
    return this.properties.find((property) => property.name === name);
  }

  toTypeScriptDefinition(symbol: string | undefined): string {
    const properties: string[] = [];
    properties.push(...this.properties.map((prop) => prop.toTypeScript()));
    if (this._additionalProperties) {
      properties.push(`[key: string]: ${this._additionalProperties.toTypeScript()};`);
    }

    return symbol ? `interface ${symbol} { ${properties.join('\n')} }` : `{ ${properties.join('\n')} }`;
  }

  toJsonSchema(): JSONSchema7Definition {
    const properties: { [key: string]: JSONSchema7Definition } = {};
    for (const prop of this.properties) {
      properties[prop.name] = prop.type.toJsonSchema();
    }

    const requiredProps = this.properties.filter((prop) => !prop.type.internal.optional).map((prop) => prop.name);

    return {
      ...this.getInternalJsonSchema(),
      type: 'object',
      properties,
      required: requiredProps.length ? requiredProps : undefined,
      additionalProperties: this._additionalProperties === false ? false : this._additionalProperties.toJsonSchema(),
    };
  }
}
