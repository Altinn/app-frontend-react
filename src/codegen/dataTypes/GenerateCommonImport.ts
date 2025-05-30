import type { JSONSchema7 } from 'json-schema';

import { CG } from 'src/codegen/CG';
import { type CodeGeneratorWithProperties, DescribableCodeGenerator } from 'src/codegen/CodeGenerator';
import { getSourceForCommon } from 'src/codegen/Common';
import { GenerateObject } from 'src/codegen/dataTypes/GenerateObject';
import type { ValidCommonKeys } from 'src/codegen/Common';
import type { GenerateProperty } from 'src/codegen/dataTypes/GenerateProperty';

/**
 * Generates an import statement for a common type (one of those defined in Common.ts).
 * In TypeScript, this is a regular import statement, and in JSON Schema, this is a reference to the definition.
 */
export class GenerateCommonImport<T extends ValidCommonKeys>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extends DescribableCodeGenerator<any>
  implements CodeGeneratorWithProperties
{
  public readonly realKey?: string;

  constructor(
    public readonly key: T,
    realKey?: string,
  ) {
    super();
    this.realKey = realKey;
  }

  toJsonSchema(): JSONSchema7 {
    this.freeze('toJsonSchema');
    return {
      ...this.getInternalJsonSchema(),
      $ref: `#/definitions/${this.key}`,
    };
  }

  toJsonSchemaDefinition(): JSONSchema7 {
    throw new Error('Should not be called');
  }

  canBeFlattened(): boolean {
    const source = this.getSource();
    return source.canBeFlattened();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toFlattened(prefix: string = ''): GenerateProperty<any>[] {
    return this.getSource().toFlattened(prefix);
  }

  toPropList(): unknown {
    this.freeze('toPropList');
    if (this.internal.docsLink) {
      // No need to get the source and generate all that if we want to link to external docs instead.
      return super.toPropList();
    }
    return this.getSource().toPropList();
  }

  toPropListDefinition(): unknown {
    throw new Error('Should not be called');
  }

  getSource() {
    return getSourceForCommon(this.key);
  }

  hasProperty(name: string): boolean {
    const source = this.getSource();
    if (source instanceof GenerateObject) {
      return source.hasProperty(name);
    }

    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getProperty(name: string): GenerateProperty<any> | undefined {
    const source = this.getSource();
    if (source instanceof GenerateObject) {
      return source.getProperty(name);
    }

    return undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getProperties(): GenerateProperty<any>[] {
    const source = this.getSource();
    if (source instanceof GenerateObject) {
      return source.getProperties();
    }

    return [];
  }

  toTypeScript(): string {
    return this.toTypeScriptDefinition();
  }

  toTypeScriptDefinition(): string {
    const _import = new CG.import({
      import: this.realKey ?? this.key,
      from: 'src/layout/common.generated',
    });

    this.freeze('toTypeScriptDefinition');
    return _import.toTypeScriptDefinition(undefined);
  }

  getName(respectVariationDifferences = true): string {
    if (!respectVariationDifferences) {
      return this.key;
    }
    return this.realKey ?? this.key;
  }
}
