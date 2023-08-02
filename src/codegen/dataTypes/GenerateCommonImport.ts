import type { JSONSchema7 } from 'json-schema';

import { CG, VariantSuffixes } from 'src/codegen/CG';
import { MaybeOptionalCodeGenerator } from 'src/codegen/CodeGenerator';
import { commonContainsVariationDifferences, getPropertiesFor } from 'src/codegen/Common';
import type { Variant } from 'src/codegen/CG';
import type { ValidCommonKeys } from 'src/codegen/Common';
import type { GenerateProperty } from 'src/codegen/dataTypes/GenerateProperty';

/**
 * Generates an import statement for a common type (one of those defined in Common.ts).
 * In TypeScript, this is a regular import statement, and in JSON Schema, this is a reference to the definition.
 */
export class GenerateCommonImport<T extends ValidCommonKeys> extends MaybeOptionalCodeGenerator<any> {
  public readonly realKey?: string;
  constructor(
    public readonly key: T,
    realKey?: string,
  ) {
    super();
    this.realKey = realKey;
  }

  transformTo(variant: Variant): this | GenerateCommonImport<any> {
    if (this.currentVariant === variant) {
      return this;
    }

    if (commonContainsVariationDifferences(this.key)) {
      const out = new GenerateCommonImport(this.key, `${this.key}${VariantSuffixes[variant]}`);
      out.internal.source = this;
      out.currentVariant = variant;

      return out;
    }

    this.currentVariant = variant;
    return this;
  }

  toJsonSchema(): JSONSchema7 {
    return { $ref: `#/definitions/${this.key}` };
  }

  getProperties(): GenerateProperty<any>[] {
    return getPropertiesFor(this.key);
  }

  toTypeScriptDefinition(symbol: string | undefined): string {
    if (!this.currentVariant) {
      throw new Error('Cannot generate TypeScript definition for common import without variant');
    }

    const _import = new CG.import({
      import: this.realKey ?? this.key,
      from: 'src/layout/common.generated',
    });

    return _import.toTypeScriptDefinition(symbol);
  }

  containsVariationDifferences(): boolean {
    return commonContainsVariationDifferences(this.key);
  }
}
