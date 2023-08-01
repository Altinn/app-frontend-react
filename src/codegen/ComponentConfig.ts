import type { JSONSchema7 } from 'json-schema';

import { CG } from 'src/codegen/CG';
import { TsVariant } from 'src/codegen/CodeGeneratorContext';
import { GenerateImportedSymbol } from 'src/codegen/dataTypes/GenerateImportedSymbol';
import { GenerateObject } from 'src/codegen/dataTypes/GenerateObject';
import { GenerateUnion } from 'src/codegen/dataTypes/GenerateUnion';
import { ComponentCategory } from 'src/layout/common';
import type { GenerateCommonImport } from 'src/codegen/dataTypes/GenerateCommonImport';
import type { GenerateProperty } from 'src/codegen/dataTypes/GenerateProperty';
import type { GenerateTextResourceBinding } from 'src/codegen/dataTypes/GenerateTextResourceBinding';
import type {
  ActionComponent,
  ContainerComponent,
  FormComponent,
  PresentationComponent,
} from 'src/layout/LayoutComponent';

export interface RequiredComponentConfig {
  category: ComponentCategory;
  rendersWithLabel: boolean;
  capabilities: {
    renderInTable: boolean;
    renderInButtonGroup: boolean;
    renderInAccordion: boolean;
    renderInAccordionGroup: boolean;
  };
}

const CategoryImports: { [Category in ComponentCategory]: GenerateImportedSymbol<any> } = {
  [ComponentCategory.Action]: new GenerateImportedSymbol<ActionComponent<any>>({
    import: 'ActionComponent',
    from: 'src/layout/LayoutComponent',
  }),
  [ComponentCategory.Form]: new GenerateImportedSymbol<FormComponent<any>>({
    import: 'FormComponent',
    from: 'src/layout/LayoutComponent',
  }),
  [ComponentCategory.Container]: new GenerateImportedSymbol<ContainerComponent<any>>({
    import: 'ContainerComponent',
    from: 'src/layout/LayoutComponent',
  }),
  [ComponentCategory.Presentation]: new GenerateImportedSymbol<PresentationComponent<any>>({
    import: 'PresentationComponent',
    from: 'src/layout/LayoutComponent',
  }),
};

export class ComponentConfig {
  public type: string;
  public typeSymbol: string;
  public layoutNodeType = new CG.import({
    import: 'LayoutNode',
    from: 'src/utils/layout/LayoutNode',
  });

  private typeDef = new CG.obj().extends(CG.common('ComponentBase'));

  constructor(public readonly config: RequiredComponentConfig) {
    if (config.category === ComponentCategory.Form) {
      this.typeDef.extends(CG.common('FormComponentProps'));
      this.extendTextResources(CG.common('TRBFormComp'));
    }
    if (config.category === ComponentCategory.Form || config.category === ComponentCategory.Container) {
      this.typeDef.extends(CG.common('SummarizableComponentProps'));
      this.extendTextResources(CG.common('TRBSummarizable'));
    }

    if (config.rendersWithLabel) {
      this.typeDef.extends(CG.common('LabeledComponentProps'));
      this.extendTextResources(CG.common('TRBLabel'));
    }
  }

  public addProperty(prop: GenerateProperty<any>): this {
    this.typeDef.addProperty(prop);
    return this;
  }

  public setType(type: string, symbol?: string): this {
    const symbolName = symbol ?? type;
    this.type = type;
    this.typeSymbol = symbolName;

    return this;
  }

  public setLayoutNodeType(type: GenerateImportedSymbol<any>): this {
    this.layoutNodeType = type;
    return this;
  }

  private ensureTextResourceBindings(): void {
    if (!this.typeDef.getProperty('textResourceBindings')) {
      this.typeDef.addProperty(new CG.prop('textResourceBindings', new CG.obj().optional()));
    }
  }

  public addTextResource(arg: GenerateTextResourceBinding): this {
    this.ensureTextResourceBindings();
    this.typeDef.getProperty('textResourceBindings')?.type.addProperty(arg);

    return this;
  }

  private extendTextResources(type: GenerateCommonImport<any>): this {
    this.ensureTextResourceBindings();
    this.typeDef.getProperty('textResourceBindings')?.type.extends(type);

    return this;
  }

  public addTextResourcesForLabel(): this {
    return this.extendTextResources(CG.common('TRBLabel'));
  }

  public makeSelectionComponent(minimalFunctionality = false): this {
    this.typeDef.extends(
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

    const existing = this.typeDef.getProperty(name)?.type;
    if (existing && existing instanceof GenerateUnion) {
      existing.addType(targetType);
    } else if (existing) {
      const union = new CG.union(existing, targetType).setTitle(title).setDescription(description).optional();
      this.typeDef.addProperty(new CG.prop(name, union));
    } else {
      this.typeDef.addProperty(new CG.prop(name, targetType));
    }

    return this;
  }

  public toTypeScript(): string {
    if (!this.typeDef.hasProperty('type')) {
      this.typeDef.addProperty(new CG.prop('type', new CG.const(this.type)).insertFirst());
    }

    // Forces the objects to register in the context and be exported via the context symbols table
    this.typeDef.exportAs(`Comp${this.typeSymbol}Unresolved`);
    this.typeDef.toTypeScript(TsVariant.Unresolved);
    this.typeDef.transformToResolved().toTypeScript(TsVariant.Resolved);

    const impl = new CG.import({
      import: this.typeSymbol,
      from: `./index`,
    });

    const staticElements = [
      this.generateDefClass(),
      `export const Config = {
         def: new ${impl._toTypeScript()}(),
         rendersWithLabel: ${this.config.rendersWithLabel ? 'true' : 'false'} as const,
       }`,
      `export type TypeConfig = {
         layout: Comp${this.typeSymbol}Unresolved;
         nodeItem: Comp${this.typeSymbol}Resolved;
         nodeObj: ${this.layoutNodeType._toTypeScript()};
       }`,
    ];

    return staticElements.join('\n\n');
  }

  private generateDefClass(): string {
    const symbol = this.typeSymbol;
    const category = this.config.category;
    const categorySymbol = CategoryImports[category]._toTypeScript();

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
    return this.typeDef.toJsonSchema();
  }
}
