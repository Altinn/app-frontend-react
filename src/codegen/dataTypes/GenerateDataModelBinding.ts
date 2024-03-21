import { CG, Variant } from 'src/codegen/CG';
import { GenerateCommonImport } from 'src/codegen/dataTypes/GenerateCommonImport';
import type { Optionality } from 'src/codegen/CodeGenerator';

/**
 * Generates a data model binding property. This is just a regular property, but this class is used as a
 * helper to make sure you always provide a description and title, and never specify the inner type yourself.
 */
export class GenerateDataModelBinding extends GenerateCommonImport<'IDataModelBinding'> {
  private readonly internalProp: GenerateCommonImport<'IDataModelReference'>;

  constructor() {
    super('IDataModelBinding');
    this.internalProp = CG.common('IDataModelReference');
  }

  optional(optionality?: Optionality<any>): this {
    super.optional(optionality);
    this.internalProp.optional(optionality);
    return this;
  }

  containsVariationDifferences(): boolean {
    return true;
  }

  transformTo(variant: Variant): GenerateCommonImport<any> {
    if (variant === Variant.External) {
      return super.transformTo(variant);
    }

    return this.internalProp.transformTo(variant);
  }
}
