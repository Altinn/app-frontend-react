import type { JSONSchema7 } from 'json-schema';

import { CG, Variant } from 'src/codegen/CG';
import { DescribableCodeGenerator } from 'src/codegen/CodeGenerator';
import { GenerateCommonImport } from 'src/codegen/dataTypes/GenerateCommonImport';
import type { CodeGenerator, CodeGeneratorWithProperties, Extract } from 'src/codegen/CodeGenerator';
import type { GenerateProperty } from 'src/codegen/dataTypes/GenerateProperty';

export type Props = GenerateProperty<any>[];
export type AsInterface<P extends Props> = {
  [K in P[number]['name']]: Extract<P[number]['type']>;
};

type Extendables = GenerateCommonImport<any> | GenerateObject<any>;

/**
 * Generates an object definition type. This is used for both interfaces and types in TypeScript, and can extend other
 * object types (either ones you generate, or from the common imports).
 */
export class GenerateObject<P extends Props>
  extends DescribableCodeGenerator<AsInterface<P>>
  implements CodeGeneratorWithProperties
{
  private readonly properties: P;
  private _additionalProperties: CodeGenerator<any> | false | undefined = false;
  private _extends: Extendables[] = [];

  constructor(...properties: P) {
    super();
    this.properties = properties;
  }

  extends(...symbols: Extendables[]): this {
    this._extends.push(...symbols);
    return this;
  }

  additionalProperties(type: CodeGenerator<any> | false | undefined) {
    this._additionalProperties = type;
    return this;
  }

  hasProperty(name: string): boolean {
    return this.properties.some((property) => {
      if (property.name === name) {
        const { onlyVariant } = property.toObject();
        return !onlyVariant || this.currentVariant === onlyVariant;
      }
    });
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
    if (!this.hasProperty(name)) {
      return undefined;
    }
    return this.properties.find((property) => property.name === name);
  }

  getProperties(): GenerateProperty<any>[] {
    return this.properties.filter((property) => {
      const { onlyVariant } = property.toObject();
      return !onlyVariant || this.currentVariant === onlyVariant;
    });
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

  private ensureExtendsHaveNames() {
    for (const e of this._extends) {
      if (e instanceof GenerateCommonImport) {
        continue;
      }
      if (!e.getName()) {
        throw new Error('Cannot extend an object that does not have a name');
      }
    }
  }

  /**
   * When extending other objects, we need to make sure that the properties of the extended objects that collide with
   * our own properties properly extend their parents. Otherwise, we'd get TypeScript errors about incompatible types.
   */
  private getPropertiesAsExtensions() {
    if (!this._extends.length) {
      return this.properties;
    }

    return this.getProperties().map((prop) => {
      const parentsWithProp = this._extends.filter((e) => e.hasProperty(prop.name)).map((e) => e.getName());
      if (!parentsWithProp.length) {
        return prop;
      }

      for (const parent of parentsWithProp) {
        if (!parent) {
          throw new Error(`Cannot extend an object that does not have a name`);
        }
      }

      const adapted = new CG.intersection(
        prop.type,
        ...parentsWithProp.map((e) => {
          const out = new CG.raw({
            typeScript: `${e}['${prop.name}']`,
          });
          out.currentVariant = this.currentVariant;

          return out;
        }),
      );

      if (prop.type.internal.optional) {
        adapted.optional();
      }
      adapted.currentVariant = this.currentVariant;

      const newProp = new CG.prop(prop.name, adapted);
      newProp.currentVariant = this.currentVariant;

      return newProp;
    });
  }

  toTypeScriptDefinition(symbol: string | undefined): string {
    this.ensureExtendsHaveNames();
    const properties: string[] = this.getPropertiesAsExtensions().map((prop) => prop.toTypeScript());

    if (this._additionalProperties) {
      if (this._additionalProperties.internal.optional) {
        properties.push(`[key: string]: ${this._additionalProperties.toTypeScript()} | undefined;`);
      } else {
        properties.push(`[key: string]: ${this._additionalProperties.toTypeScript()};`);
      }
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
    this.ensureExtendsHaveNames();
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
