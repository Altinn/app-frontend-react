import type { JSONSchema7 } from 'json-schema';

import { CG } from 'src/codegen/CG';
import { GenerateImportedSymbol } from 'src/codegen/dataTypes/GenerateImportedSymbol';
import { GenerateObject } from 'src/codegen/dataTypes/GenerateObject';
import { GenerateUnion } from 'src/codegen/dataTypes/GenerateUnion';
import { ComponentCategory } from 'src/layout/common';
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

  private unresolved = new CG.obj().extends(CG.common('ILayoutCompBase'));
  private resolved = new CG.obj().extends(CG.common('ILayoutCompBase', 'resolved'));

  constructor(public readonly config: RequiredComponentConfig) {
    if (config.category === ComponentCategory.Form) {
      this.unresolved.extends(CG.common('ILayoutCompForm'));
      this.resolved.extends(CG.common('ILayoutCompForm', 'resolved'));
      this.addTextResourcesForFormComponents();
    }
    if (config.category === ComponentCategory.Form || config.category === ComponentCategory.Container) {
      this.unresolved.extends(CG.common('ILayoutCompSummarizable'));
      this.resolved.extends(CG.common('ILayoutCompSummarizable', 'resolved'));
      this.addTextResourcesForSummarizableComponents();
    }

    if (config.rendersWithLabel) {
      this.unresolved.extends(CG.common('ILayoutCompWithLabel'));
      this.resolved.extends(CG.common('ILayoutCompWithLabel'));
      this.addTextResourcesForLabel();
    }
  }

  public addProperty(
    prop: GenerateProperty<any> | { unresolved: GenerateProperty<any>; resolved: GenerateProperty<any> },
  ): this {
    if ('unresolved' in prop) {
      this.unresolved.addProperty(prop.unresolved);
      this.resolved.addProperty(prop.resolved);
      return this;
    }

    this.unresolved.addProperty(prop);
    if (prop.containsExpressions()) {
      this.resolved.addProperty(prop.transformToResolved());
    } else {
      this.resolved.addProperty(prop);
    }

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
    if (!this.unresolved.getProperty('textResourceBindings')) {
      this.unresolved.addProperty(new CG.prop('textResourceBindings', new CG.obj().optional()));
      this.resolved.addProperty(new CG.prop('textResourceBindings', new CG.obj().optional()));
    }
  }

  public addTextResource(arg: GenerateTextResourceBinding): this {
    this.ensureTextResourceBindings();
    for (const targetObject of [this.unresolved, this.resolved]) {
      const bindings = targetObject.getProperty('textResourceBindings')?.type;
      if (bindings instanceof GenerateObject) {
        if (targetObject === this.unresolved) {
          bindings.addProperty(arg);
        } else {
          bindings.addProperty(arg.transformToResolved());
        }
      }
    }

    return this;
  }

  private addTextResourcesForSummarizableComponents(): this {
    this.ensureTextResourceBindings();
    const unresolved = this.unresolved.getProperty('textResourceBindings')?.type as GenerateObject<any>;
    const resolved = this.resolved.getProperty('textResourceBindings')?.type as GenerateObject<any>;
    unresolved.extends(CG.common('TRBSummarizable'));
    resolved.extends(CG.common('TRBSummarizable', 'resolved'));

    return this;
  }

  private addTextResourcesForFormComponents(): this {
    this.ensureTextResourceBindings();
    const unresolved = this.unresolved.getProperty('textResourceBindings')?.type as GenerateObject<any>;
    const resolved = this.resolved.getProperty('textResourceBindings')?.type as GenerateObject<any>;
    unresolved.extends(CG.common('TRBFormComp'));
    resolved.extends(CG.common('TRBFormComp', 'resolved'));

    return this;
  }

  public addTextResourcesForLabel(): this {
    this.ensureTextResourceBindings();
    const unresolved = this.unresolved.getProperty('textResourceBindings')?.type as GenerateObject<any>;
    const resolved = this.resolved.getProperty('textResourceBindings')?.type as GenerateObject<any>;
    unresolved.extends(CG.common('TRBLabel'));
    resolved.extends(CG.common('TRBLabel', 'resolved'));

    return this;
  }

  public makeSelectionComponent(minimalFunctionality = false): this {
    if (minimalFunctionality) {
      this.unresolved.extends(CG.common('ISelectionComponentMinimal'));
      this.resolved.extends(CG.common('ISelectionComponentMinimal'));
    } else {
      this.unresolved.extends(CG.common('ISelectionComponent'));
      this.resolved.extends(CG.common('ISelectionComponent'));
    }

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

    for (const targetObject of [this.unresolved, this.resolved]) {
      const existing = targetObject.getProperty(name)?.type;
      if (existing && existing instanceof GenerateUnion) {
        existing.addType(targetType);
      } else if (existing) {
        const union = new CG.union(existing, targetType).setTitle(title).setDescription(description).optional();
        targetObject.addProperty(new CG.prop(name, union));
      } else {
        targetObject.addProperty(new CG.prop(name, targetType));
      }
    }

    return this;
  }

  public toTypeScript(): string {
    this.addProperty(new CG.prop('type', new CG.const(this.type)).insertFirst());
    this.unresolved.exportAs(`ILayoutComp${this.typeSymbol}`);
    this.resolved.exportAs(`${this.typeSymbol}Item`);

    // Forces the objects to register in the context and be exported via the context symbols table
    this.unresolved.toTypeScript();
    this.resolved.toTypeScript();

    const staticElements: string[] = [];

    const symbol = this.typeSymbol;
    const category = this.config.category;
    const categorySymbol = CategoryImports[category].toTypeScript();

    staticElements.push(`export abstract class ${symbol}Def extends ${categorySymbol}<'${this.type}'> {
      canRenderInTable(): boolean {
        return ${this.config.capabilities.renderInTable ? 'true' : 'false'};
      }

      canRenderInButtonGroup(): boolean {
        return ${this.config.capabilities.renderInButtonGroup ? 'true' : 'false'};
      }
    }`);

    const impl = new CG.import({
      import: symbol,
      from: `./index`,
    });

    staticElements.push(`export const Config = {
      def: new ${impl.toTypeScript()}(),
      rendersWithLabel: ${this.config.rendersWithLabel ? 'true' : 'false'} as const,
    }`);

    staticElements.push(`export type TypeConfig = {
      layout: ILayoutComp${this.typeSymbol};
      nodeItem: ${this.typeSymbol}Item;
      nodeObj: ${this.layoutNodeType.toTypeScript()};
    }`);

    return staticElements.join('\n\n');
  }

  public toJsonSchema(): JSONSchema7 {
    return this.unresolved.toJsonSchema();
  }
}
