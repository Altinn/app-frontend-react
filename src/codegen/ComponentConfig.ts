import type { JSONSchema7 } from 'json-schema';

import { CG } from 'src/codegen/CG';
import { GenerateComponentLike } from 'src/codegen/dataTypes/GenerateComponentLike';
import { GenerateImportedSymbol } from 'src/codegen/dataTypes/GenerateImportedSymbol';
import { CompCategory } from 'src/layout/common';
import type {
  ActionComponent,
  ContainerComponent,
  FormComponent,
  PresentationComponent,
} from 'src/layout/LayoutComponent';

export interface RequiredComponentConfig {
  category: CompCategory;
  rendersWithLabel: boolean;
  capabilities: {
    renderInTable: boolean;
    renderInButtonGroup: boolean;
    renderInAccordion: boolean;
    renderInAccordionGroup: boolean;
  };
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

export class ComponentConfig extends GenerateComponentLike {
  public type: string;
  public typeSymbol: string;
  public layoutNodeType = baseLayoutNode;

  constructor(public readonly config: RequiredComponentConfig) {
    super();
    this.inner.extends(CG.common('ComponentBase'));

    if (config.category === CompCategory.Form) {
      this.inner.extends(CG.common('FormComponentProps'));
      this.extendTextResources(CG.common('TRBFormComp'));
    }
    if (config.category === CompCategory.Form || config.category === CompCategory.Container) {
      this.inner.extends(CG.common('SummarizableComponentProps'));
      this.extendTextResources(CG.common('TRBSummarizable'));
    }

    if (config.rendersWithLabel) {
      this.inner.extends(CG.common('LabeledComponentProps'));
      this.extendTextResources(CG.common('TRBLabel'));
    }
  }

  public setType(type: string, symbol?: string): this {
    const symbolName = symbol ?? type;
    this.type = type;
    this.typeSymbol = symbolName;
    this.inner.addProperty(new CG.prop('type', new CG.const(this.type)).insertFirst());

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

    const nodeObj = this.layoutNodeType.toTypeScript();
    const nodeSuffix = this.layoutNodeType === baseLayoutNode ? `<'${this.type}'>` : '';

    const staticElements = [
      `export const Config = {
         def: new ${impl.toTypeScript()}(),
         rendersWithLabel: ${this.config.rendersWithLabel ? 'true' : 'false'} as const,
         nodeConstructor: ${nodeObj},
         capabilities: ${JSON.stringify(this.config.capabilities, null, 2)} as const,
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

    return `export abstract class ${symbol}Def extends ${categorySymbol}<'${this.type}'> {
      protected readonly type = '${this.type}';
    }`;
  }

  public toJsonSchema(): JSONSchema7 {
    this.beforeFinalizing();
    return this.inner.toJsonSchema();
  }
}
