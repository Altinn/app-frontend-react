import type { JSONSchema7 } from 'json-schema';

import { Variant } from 'src/codegen/CG';
import { DescribableCodeGenerator } from 'src/codegen/CodeGenerator';
import type { Extract } from 'src/codegen/CodeGenerator';
import type { GenerateCommonImport } from 'src/codegen/dataTypes/GenerateCommonImport';
import type { GenerateProperty } from 'src/codegen/dataTypes/GenerateProperty';

export type Props = GenerateProperty<any>[];
export type AsInterface<P extends Props> = {
  [K in P[number]['name']]: Extract<P[number]['type']>;
};

/**
 * Generates an object definition type. This is used for both interfaces and types in TypeScript, and can extend other
 * object types (either ones you generate, or from the common imports).
 */
export class GenerateObject<P extends Props> extends DescribableCodeGenerator<AsInterface<P>> {
  private readonly properties: P;
  private _additionalProperties: DescribableCodeGenerator<any> | false | undefined = false;
  private _extends: GenerateCommonImport<any>[] = [];

  constructor(...properties: P) {
    super();
    this.properties = properties;
  }

  extends(...symbols: GenerateCommonImport<any>[]): this {
    this._extends.push(...symbols);
    return this;
  }

  additionalProperties(type: DescribableCodeGenerator<any> | false | undefined) {
    this._additionalProperties = type;
    return this;
  }

  hasProperty(name: string): boolean {
    return this.properties.some((property) => property.name === name);
  }

  addProperty(prop: GenerateProperty<any>): this {
    const { name, insertBefore, insertAfter, insertFirst } = prop.toObject();

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

    if (insertFirst) {
      this.properties.unshift(prop);
      return this;
    }

    this.properties.push(prop);
    return this;
  }

  getProperty(name: string): GenerateProperty<any> | undefined {
    return this.properties.find((property) => property.name === name);
  }

  getProperties(): GenerateProperty<any>[] {
    return this.properties;
  }

  transformTo(variant: Variant): GenerateObject<any> {
    if (this.currentVariant === variant) {
      return this;
    }

    const newProps: Props = [];
    for (const prop of this.properties) {
      if (!prop.shouldExistIn(variant)) {
        continue;
      }

      newProps.push(prop.transformTo(variant));
    }

    const next = new GenerateObject(...newProps);
    next._additionalProperties = this._additionalProperties
      ? (this._additionalProperties.transformTo(variant) as DescribableCodeGenerator<any>)
      : this._additionalProperties;
    next._extends = this._extends.map((e) => e.transformTo(variant));
    next.internal = structuredClone(this.internal);
    next.internal.source = this;
    next.currentVariant = variant;

    return next;
  }

  containsVariationDifferences(): boolean {
    if (this.internal.source?.containsVariationDifferences()) {
      return true;
    }

    if (this.properties.some((prop) => prop.containsVariationDifferences())) {
      return true;
    }
    if (this._additionalProperties && this._additionalProperties.containsVariationDifferences()) {
      return true;
    }
    return this._extends.some((e) => e.containsVariationDifferences());
  }

  toTypeScriptDefinition(symbol: string | undefined): string {
    const properties: string[] = this.properties.map((prop) => prop.toTypeScript());

    if (this._additionalProperties) {
      properties.push(`[key: string]: ${this._additionalProperties.toTypeScript()};`);
    }

    const extendsClause = this._extends.length
      ? ` extends ${this._extends.map((e) => e.toTypeScript()).join(', ')}`
      : '';
    const extendsIntersection = this._extends.length
      ? ` & ${this._extends.map((e) => e.toTypeScript()).join(' & ')}`
      : '';

    if (!properties.length && this._extends.length) {
      return symbol
        ? `type ${symbol} = ${extendsIntersection.replace(/^ & /, '')};`
        : `${extendsIntersection.replace(/^ & /, '')}`;
    }

    if (!properties.length) {
      throw new Error('About to generate empty object, this is probably a bug');
    }

    return symbol
      ? `interface ${symbol}${extendsClause} { ${properties.join('\n')} }`
      : `{ ${properties.join('\n')} }${extendsIntersection}`;
  }

  toJsonSchema(): JSONSchema7 {
    if (this._extends.length) {
      const allProperties: { [key: string]: true } = {};
      const requiredProperties: string[] = [];

      for (const e of this._extends) {
        for (const prop of e.getProperties()) {
          allProperties[prop.name] = true;
          if (!prop.type.internal.optional) {
            requiredProperties.push(prop.name);
          }
        }
      }

      for (const prop of this.properties) {
        if (!prop.shouldExistIn(Variant.External)) {
          continue;
        }
        allProperties[prop.name] = true;
        if (!prop.type.internal.optional) {
          requiredProperties.push(prop.name);
        }
      }

      const allOf = this._extends.map((e) => e.toJsonSchema());
      if (this.properties.length) {
        allOf.push(this.innerToJsonSchema(false));
      }

      return {
        allOf: [
          ...allOf,
          {
            // This trick makes it possible to extend multiple other object, but still
            // preserve the behaviour of additionalProperties = false. If it was set on each of the objects we extended,
            // the objects would mutually exclude each other's properties.
            type: 'object',
            properties: allProperties,
            required: requiredProperties.length ? requiredProperties : undefined,
            additionalProperties: this.additionalPropertiesToJsonSchema(),
          },
        ],
      };
    }

    return this.innerToJsonSchema();
  }

  private innerToJsonSchema(respectAdditionalProperties = true): JSONSchema7 {
    const properties: { [key: string]: JSONSchema7 } = {};
    for (const prop of this.properties) {
      if (!prop.shouldExistIn(Variant.External)) {
        // JsonSchema only supports external variants
        continue;
      }

      properties[prop.name] = prop.type.toJsonSchema();
    }

    const requiredProps = this.properties
      .filter((prop) => !prop.type.internal.optional && prop.shouldExistIn(Variant.External))
      .map((prop) => prop.name);

    return {
      ...this.getInternalJsonSchema(),
      type: 'object',
      properties,
      required: requiredProps.length ? requiredProps : undefined,
      additionalProperties: respectAdditionalProperties ? this.additionalPropertiesToJsonSchema() : undefined,
    };
  }

  private additionalPropertiesToJsonSchema(): JSONSchema7['additionalProperties'] {
    if (this._additionalProperties === false) {
      return false;
    }

    return this._additionalProperties?.toJsonSchema();
  }
}
