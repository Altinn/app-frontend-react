import { CG } from 'src/codegen/CG';
import { ComponentConfig } from 'src/codegen/ComponentConfig';
import { GenerateObject } from 'src/codegen/dataTypes/GenerateObject';
import { GenerateUnion } from 'src/codegen/dataTypes/GenerateUnion';
import type { GenerateCommonImport } from 'src/codegen/dataTypes/GenerateCommonImport';
import type { GenerateProperty } from 'src/codegen/dataTypes/GenerateProperty';
import type { GenerateTextResourceBinding } from 'src/codegen/dataTypes/GenerateTextResourceBinding';

/**
 * A class that can be used to generate a component-like object. This is most likely used for advanced components
 * where it is possible the base component configuration is a union of multiple possible configurations varying wildly.
 * One example of this is Group (which can be a non-repeating group, a repeating group, etc)
 *
 * The way you should use this is to override the exported symbol of your component, and add new symbols of this type.
 * I.e., you could override the exported symbol to a GenerateUnion-type, and adding multiples of this type to the union.
 */
export class GenerateComponentLike {
  readonly inner = new CG.obj().extends(CG.common('ComponentBase'));

  public addProperty(prop: GenerateProperty<any>): this {
    this.inner.addProperty(prop);
    return this;
  }

  private ensureTextResourceBindings(): void {
    if (!this.inner.getProperty('textResourceBindings')) {
      this.inner.addProperty(new CG.prop('textResourceBindings', new CG.obj().optional()));
    }
  }

  public addTextResource(arg: GenerateTextResourceBinding): this {
    this.ensureTextResourceBindings();
    this.inner.getProperty('textResourceBindings')?.type.addProperty(arg);

    return this;
  }

  public extendTextResources(type: GenerateCommonImport<any>): this {
    this.ensureTextResourceBindings();
    this.inner.getProperty('textResourceBindings')?.type.extends(type);

    return this;
  }

  public addTextResourcesForLabel(): this {
    return this.extendTextResources(CG.common('TRBLabel'));
  }

  public makeSelectionComponent(minimalFunctionality = false): this {
    this.inner.extends(
      minimalFunctionality ? CG.common('ISelectionComponentMinimal') : CG.common('ISelectionComponent'),
    );

    return this;
  }

  /**
   * Adding multiple data model bindings to the component makes it a union
   * PRIORITY: Support required and optional bindings
   */
  public addDataModelBinding(type: 'simple' | 'list' | GenerateObject<any>): this {
    const mapping = {
      simple: CG.common(`IDataModelBindingsSimple`),
      list: CG.common(`IDataModelBindingsList`),
    };
    const targetType = typeof type === 'string' ? mapping[type] : type;

    const name = 'dataModelBindings';
    const title = 'Data model bindings';
    const description = 'Describes the location in the data model where the component should store its value(s)';

    if (targetType instanceof GenerateObject) {
      targetType.setTitle(title).setDescription(description).optional();
    }

    const existing = this.inner.getProperty(name)?.type;
    if (existing && existing instanceof GenerateUnion) {
      existing.addType(targetType);
    } else if (existing) {
      const union = new CG.union(existing, targetType).setTitle(title).setDescription(description).optional();
      this.inner.addProperty(new CG.prop(name, union));
    } else {
      this.inner.addProperty(new CG.prop(name, targetType));
    }

    return this;
  }

  extends(type: GenerateCommonImport<any> | ComponentConfig): this {
    if (type instanceof ComponentConfig) {
      return this;
      // throw new Error('Not implemented');
    }

    this.inner.extends(type);
    return this;
  }
}
