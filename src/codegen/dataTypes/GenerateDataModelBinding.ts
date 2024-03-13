import { CG, Variant } from 'src/codegen/CG';
import { GenerateProperty } from 'src/codegen/dataTypes/GenerateProperty';
import type { Optionality } from 'src/codegen/CodeGenerator';
import type { GenerateObject } from 'src/codegen/dataTypes/GenerateObject';
import type { GenerateString } from 'src/codegen/dataTypes/GenerateString';
import type { GenerateUnion } from 'src/codegen/dataTypes/GenerateUnion';

export interface DataModelBindingConfig {
  name: string;
  title: string;
  description: string;
}

/**
 * Generates a data model binding property. This is just a regular property, but this class is used as a
 * helper to make sure you always provide a description and title, and never specify the inner type yourself.
 */
export class GenerateDataModelBinding extends GenerateProperty<
  GenerateUnion<[GenerateString, GenerateObject<[GenerateProperty<GenerateString>, GenerateProperty<GenerateString>]>]>
> {
  private readonly externalProp: GenerateUnion<
    [GenerateString, GenerateObject<[GenerateProperty<GenerateString>, GenerateProperty<GenerateString>]>]
  >;
  private readonly internalProp: GenerateObject<[GenerateProperty<GenerateString>, GenerateProperty<GenerateString>]>;

  constructor(config: DataModelBindingConfig) {
    const actualProp = new CG.union(
      new CG.str(),
      new CG.obj(new CG.prop('dataType', new CG.str()), new CG.prop('property', new CG.str())),
    );
    super(config.name, actualProp);
    this.externalProp = actualProp;
    this.internalProp = new CG.obj(new CG.prop('dataType', new CG.str()), new CG.prop('property', new CG.str()));
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
