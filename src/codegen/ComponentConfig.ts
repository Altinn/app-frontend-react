import type { JSONSchema7 } from 'json-schema';

import { CG, Variant } from 'src/codegen/CG';
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
    this.inner.addProperty(
      new CG.prop('textResourceBindings', new CG.raw({ typeScript: 'undefined' }).optional()).onlyIn(Variant.Internal),
    );
    this.inner.addProperty(
      new CG.prop('dataModelBindings', new CG.raw({ typeScript: 'undefined' }).optional()).onlyIn(Variant.Internal),
    );

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

  public generateConfigFile(): string {
    // Forces the objects to register in the context and be exported via the context symbols table
    this.inner.exportAs(`Comp${this.typeSymbol}`);
    const ext = this.inner.transformTo(Variant.External);
    ext.toTypeScript();
    const int = this.inner.transformTo(Variant.Internal);
    int.toTypeScript();

    const impl = new CG.import({
      import: this.typeSymbol,
      from: `./index`,
    }).transformTo(Variant.Internal);

    const nodeObj = this.layoutNodeType.transformTo(Variant.Internal).toTypeScript();
    const nodeSuffix = this.layoutNodeType === baseLayoutNode ? `<${int.getName()}, '${this.type}'>` : '';

    const staticElements = [
      `export const Config = {
         def: new ${impl.toTypeScript()}(),
         rendersWithLabel: ${this.config.rendersWithLabel ? 'true' : 'false'} as const,
         nodeConstructor: ${nodeObj},
       }`,
      `export type TypeConfig = {
         layout: ${ext.getName()};
         nodeItem: ${int.getName()};
         nodeObj: ${nodeObj}${nodeSuffix};
       }`,
    ];

    return staticElements.join('\n\n');
  }

  public generateDefClass(): string {
    const symbol = this.typeSymbol;
    const category = this.config.category;
    const categorySymbol = CategoryImports[category].transformTo(Variant.Internal).toTypeScript();

    const methods: string[] = [];
    for (const [key, value] of Object.entries(this.config.capabilities)) {
      if (key.startsWith('renderIn')) {
        const name = key.replace('renderIn', '');
        const valueStr = JSON.stringify(value);
        methods.push(`canRenderIn${name}(): ${valueStr} {\nreturn ${valueStr}; }`);
        continue;
      }

      throw new Error(`Unknown capability ${key}`);
    }

    return `export abstract class ${symbol}Def extends ${categorySymbol}<'${this.type}'> {
      ${methods.join('\n\n')}
    }`;
  }

  public toJsonSchema(): JSONSchema7 {
    return this.inner.transformTo(Variant.External).toJsonSchema();
  }
}
