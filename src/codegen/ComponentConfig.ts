import type { JSONSchema7 } from 'json-schema';

import { CG } from 'src/codegen/CG';
import { GenerateImportedSymbol } from 'src/codegen/dataTypes/GenerateImportedSymbol';
import { GenerateRaw } from 'src/codegen/dataTypes/GenerateRaw';
import { GenerateUnion } from 'src/codegen/dataTypes/GenerateUnion';
import { CompCategory } from 'src/layout/common';
import type { GenerateCommonImport } from 'src/codegen/dataTypes/GenerateCommonImport';
import type { GenerateObject } from 'src/codegen/dataTypes/GenerateObject';
import type { GenerateProperty } from 'src/codegen/dataTypes/GenerateProperty';
import type { GenerateTextResourceBinding } from 'src/codegen/dataTypes/GenerateTextResourceBinding';
import type {
  ActionComponent,
  ContainerComponent,
  FormComponent,
  PresentationComponent,
} from 'src/layout/LayoutComponent';

export enum LabelRendering {
  /** Turns off label rendering */
  Off = 'off',

  /** Turns off label rendering (sets no text resource bindings for you), but enables labelSettings */
  OnlySettings = 'onlySettings',

  /** Renders the label automatically outside the component (from GenericComponent.tsx) */
  FromGenericComponent = 'fromGenericComponent',

  /** Lets you render the label yourself, inside the component code */
  InSelf = 'inSelf',
}

export interface RequiredComponentConfig {
  category: CompCategory;
  rendersWithLabel: LabelRendering;
  directRendering?: boolean;
  capabilities: ComponentCapabilities;
}

/**
 * Capabilities are configured directly when setting up a component config. You have to fill out each of the
 * properties in the object.
 * @see CompWithCap
 * @see getComponentCapabilities
 */
export interface ComponentCapabilities {
  renderInTable: boolean;
  renderInButtonGroup: boolean;
  renderInAccordion: boolean;
  renderInAccordionGroup: boolean;
}

/**
 * Behaviors are more implicit, and are derived from the component config. I.e. when making a component summarizable,
 * the behavior is set to true.
 * @see CompWithBehavior
 * @see getComponentBehavior
 */
export interface ComponentBehaviors {
  isSummarizable: boolean;
  canHaveLabel: boolean;
  canHaveOptions: boolean;
}

const CategoryImports: { [Category in CompCategory]: GenerateImportedSymbol<any> } = {
  [CompCategory.Action]: new GenerateImportedSymbol<ActionComponent<any>>({
    import: 'ActionComponent',
    from: 'src/layout/LayoutComponent',
  }),
  [CompCategory.Form]: new GenerateImportedSymbol<FormComponent<any>>({
    import: 'FormComponent',
    from: 'src/layout/LayoutComponent',
  }),
  [CompCategory.Container]: new GenerateImportedSymbol<ContainerComponent<any>>({
    import: 'ContainerComponent',
    from: 'src/layout/LayoutComponent',
  }),
  [CompCategory.Presentation]: new GenerateImportedSymbol<PresentationComponent<any>>({
    import: 'PresentationComponent',
    from: 'src/layout/LayoutComponent',
  }),
};

const baseLayoutNode = new GenerateImportedSymbol({
  import: 'BaseLayoutNode',
  from: 'src/utils/layout/LayoutNode',
});

export class ComponentConfig {
  public type: string;
  public typeSymbol: string;
  public layoutNodeType = baseLayoutNode;
  readonly inner = new CG.obj();
  public behaviors: ComponentBehaviors = {
    isSummarizable: false,
    canHaveLabel: false,
    canHaveOptions: false,
  };

  constructor(public readonly config: RequiredComponentConfig) {
    this.inner.extends(CG.common('ComponentBase'));

    if (config.category === CompCategory.Form) {
      this.inner.extends(CG.common('FormComponentProps'));
      this.extendTextResources(CG.common('TRBFormComp'));
    }
    if (config.category === CompCategory.Form || config.category === CompCategory.Container) {
      this.inner.extends(CG.common('SummarizableComponentProps'));
      this.extendTextResources(CG.common('TRBSummarizable'));
      this.behaviors.isSummarizable = true;
    }

    if (
      config.rendersWithLabel === LabelRendering.FromGenericComponent ||
      config.rendersWithLabel === LabelRendering.InSelf
    ) {
      this.inner.extends(CG.common('LabeledComponentProps'));
      this.extendTextResources(CG.common('TRBLabel'));
      this.behaviors.canHaveLabel = true;
    } else if (config.rendersWithLabel === LabelRendering.OnlySettings) {
      this.inner.extends(CG.common('LabeledComponentProps'));
    }
  }

  public setType(type: string, symbol?: string): this {
    const symbolName = symbol ?? type;
    this.type = type;
    this.typeSymbol = symbolName;
    this.inner.addProperty(new CG.prop('type', new CG.const(this.type)).insertFirst());

    return this;
  }

  public addProperty(prop: GenerateProperty<any>): this {
    this.inner.addProperty(prop);
    return this;
  }

  private ensureTextResourceBindings(): void {
    const existing = this.inner.getProperty('textResourceBindings');
    if (!existing || existing.type instanceof GenerateRaw) {
      this.inner.addProperty(new CG.prop('textResourceBindings', new CG.obj().optional()));
    }
  }

  /**
   * TODO: Add support for some required text resource bindings (but only make them required in external types)
   */
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

  public makeSelectionComponent(full = true): this {
    this.inner.extends(full ? CG.common('ISelectionComponentFull') : CG.common('ISelectionComponent'));
    this.behaviors.canHaveOptions = true;

    return this;
  }

  /**
   * Adding multiple data model bindings to the component makes it a union
   */
  public addDataModelBinding(
    type:
      | GenerateCommonImport<
          | 'IDataModelBindingsSimple'
          | 'IDataModelBindingsList'
          | 'IDataModelBindingsOptionsSimple'
          | 'IDataModelBindingsLikert'
        >
      | GenerateObject<any>,
  ): this {
    const name = 'dataModelBindings';
    const existing = this.inner.getProperty(name)?.type;
    if (existing && existing instanceof GenerateUnion) {
      existing.addType(type);
    } else if (existing && !(existing instanceof GenerateRaw)) {
      const union = new CG.union(existing, type);
      this.inner.addProperty(new CG.prop(name, union));
    } else {
      this.inner.addProperty(new CG.prop(name, type));
    }

    return this;
  }

  extends(type: GenerateCommonImport<any> | ComponentConfig): this {
    if (type instanceof ComponentConfig) {
      this.inner.extends(type.inner);
      return this;
    }

    this.inner.extends(type);
    return this;
  }

  // This will not be used at the moment after we split the group to several components.
  // However, this is nice to keep for future components that might need it.
  public setLayoutNodeType(type: GenerateImportedSymbol<any>): this {
    this.layoutNodeType = type;
    return this;
  }

  private beforeFinalizing(): void {
    // We have to add these to our typescript types in order for ITextResourceBindings<T>, and similar to work.
    // Components that doesn't have them, will always have the 'undefined' value.
    if (!this.inner.hasProperty('dataModelBindings')) {
      this.inner.addProperty(
        new CG.prop('dataModelBindings', new CG.raw({ typeScript: 'undefined' }).optional()).omitInSchema(),
      );
    }
    if (!this.inner.hasProperty('textResourceBindings')) {
      this.inner.addProperty(
        new CG.prop('textResourceBindings', new CG.raw({ typeScript: 'undefined' }).optional()).omitInSchema(),
      );
    }
  }

  public generateConfigFile(): string {
    this.beforeFinalizing();
    // Forces the objects to register in the context and be exported via the context symbols table
    this.inner.exportAs(`Comp${this.typeSymbol}External`);
    this.inner.toTypeScript();

    const impl = new CG.import({
      import: this.typeSymbol,
      from: `./index`,
    });

    const labelRendering = new CG.import({
      import: 'LabelRendering',
      from: `src/codegen/ComponentConfig`,
    });

    const nodeObj = this.layoutNodeType.toTypeScript();
    const nodeSuffix = this.layoutNodeType === baseLayoutNode ? `<'${this.type}'>` : '';

    const staticElements = [
      `export const Config = {
         def: new ${impl.toTypeScript()}(),
         rendersWithLabel: ${labelRendering.toTypeScript()}.${ucFirst(this.config.rendersWithLabel)} as const,
         nodeConstructor: ${nodeObj},
         capabilities: ${JSON.stringify(this.config.capabilities, null, 2)} as const,
         behaviors: ${JSON.stringify(this.behaviors, null, 2)} as const,
       }`,
      `export type TypeConfig = {
         layout: ${this.inner.getName()};
         nodeObj: ${nodeObj}${nodeSuffix};
       }`,
    ];

    return staticElements.join('\n\n');
  }

  public generateDefClass(): string {
    const symbol = this.typeSymbol;
    const category = this.config.category;
    const categorySymbol = CategoryImports[category].toTypeScript();

    if (this.config.directRendering && this.config.rendersWithLabel === LabelRendering.FromGenericComponent) {
      throw new Error(
        `Component ${symbol} is set to directRendering, but also rendersWithLabel: LabelRendering.FromGenericComponent. ` +
          `This is not allowed, as the label cannot be rendered outside the component when it is set ` +
          `up to render directly.`,
      );
    }

    const extra = this.config.directRendering ? 'directRender(): boolean { return true; }' : '';

    return `export abstract class ${symbol}Def extends ${categorySymbol}<'${this.type}'> {
      protected readonly type = '${this.type}';

      ${extra}
    }`;
  }

  public toJsonSchema(): JSONSchema7 {
    this.beforeFinalizing();
    return this.inner.toJsonSchema();
  }
}

function ucFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
