import { CG, Variant } from 'src/codegen/CG';
import { GenerateProperty } from 'src/codegen/dataTypes/GenerateProperty';
import type { Optionality } from 'src/codegen/CodeGenerator';
import type { GenerateCommonImport } from 'src/codegen/dataTypes/GenerateCommonImport';

export interface DataModelBindingConfig {
  name: string;
  title: string;
  description: string;
}

type InternalType = GenerateCommonImport<'IDataModelReference'>;
type ExternalType = GenerateCommonImport<'IDataModelBinding'>;
/**
 * Generates a data model binding property. This is just a regular property, but this class is used as a
 * helper to make sure you always provide a description and title, and never specify the inner type yourself.
 */
export class GenerateDataModelBinding extends GenerateProperty<ExternalType> {
  private readonly externalProp: ExternalType;
  private readonly internalProp: InternalType;

  constructor(config: DataModelBindingConfig) {
    // TODO(Datamodels): Add title and description
    const internalProp = CG.common('IDataModelReference');
    const externalProp = CG.common('IDataModelBinding');
    super(config.name, externalProp);
    this.internalProp = internalProp;
    this.externalProp = externalProp;
  }

  optional(optionality?: Optionality<any>): this {
    this.externalProp.optional(optionality);
    this.internalProp.optional(optionality);
    return this;
  }

  containsVariationDifferences(): boolean {
    return true;
  }

  toTypeScript(): string {
    throw new Error('Not transformed to any variant yet - please call transformTo(variant) first');
  }

  transformTo(variant: Variant): GenerateProperty<any> {
    if (variant === Variant.External) {
      return new CG.prop(this.name, this.externalProp).transformTo(variant);
    }

    return new CG.prop(this.name, this.internalProp).transformTo(variant);
  }
}
