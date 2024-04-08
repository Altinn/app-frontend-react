import type { JSONSchema7 } from 'json-schema';

import { CG } from 'src/codegen/CG';
import { LabelRendering } from 'src/codegen/Config';
import { GenerateImportedSymbol } from 'src/codegen/dataTypes/GenerateImportedSymbol';
import { GenerateRaw } from 'src/codegen/dataTypes/GenerateRaw';
import { GenerateUnion } from 'src/codegen/dataTypes/GenerateUnion';
import { CompCategory } from 'src/layout/common';
import { isNodeStateChildrenPlugin } from 'src/utils/layout/NodeStatePlugin';
import { SimpleChildrenPlugin } from 'src/utils/layout/plugins/SimpleChildrenPlugin';
import type { ComponentBehaviors, RequiredComponentConfig } from 'src/codegen/Config';
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
import type { NodeStateChildrenPlugin, NodeStatePlugin } from 'src/utils/layout/NodeStatePlugin';

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
  protected plugins: NodeStatePlugin<any>[] = [];

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

  public addPlugin(plugin: NodeStatePlugin<any>): this {
    this.plugins.push(plugin);
    return this;
  }

  /**
   * Shortcut to adding support for simple (non-repeating) children in a component
   */
  public addSimpleChildrenPlugin(description = 'List of child component IDs to show inside'): this {
    this.plugins.push(new SimpleChildrenPlugin());
    this.addProperty(
      new CG.prop('children', new CG.arr(new CG.str()).setTitle('Children').setDescription(description)),
    );

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
      from: `src/codegen/Config`,
    });

    const nodeObj = this.layoutNodeType.toTypeScript();
    const nodeSuffix = this.layoutNodeType === baseLayoutNode ? `<'${this.type}'>` : '';

    const CompCategory = new CG.import({
      import: 'CompCategory',
      from: `src/layout/common`,
    });

    const staticElements = [
      `export const Config = {
         def: new ${impl.toTypeScript()}(),
         rendersWithLabel: ${labelRendering.toTypeScript()}.${ucFirst(this.config.rendersWithLabel)} as const,
         nodeConstructor: ${nodeObj},
         capabilities: ${JSON.stringify(this.config.capabilities, null, 2)} as const,
         behaviors: ${JSON.stringify(this.behaviors, null, 2)} as const,
       }`,
      `export type TypeConfig = {
         category: ${CompCategory}.${this.config.category},
         layout: ${this.inner};
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

    const StateFactoryProps = new CG.import({
      import: 'StateFactoryProps',
      from: 'src/utils/layout/itemState',
    });

    const BaseItemState = new CG.import({
      import: 'BaseItemState',
      from: 'src/utils/layout/itemState',
    });

    const CompInternal = new CG.import({
      import: 'CompInternal',
      from: 'src/layout/layout',
    });

    const ExprResolver = new CG.import({
      import: 'ExprResolver',
      from: 'src/layout/LayoutComponent',
    });

    const isFormComponent = this.config.category === CompCategory.Form;
    const isSummarizable = this.behaviors.isSummarizable;

    const evalCommonProps = [
      { base: CG.common('ComponentBase'), condition: true, evaluator: 'evalBase' },
      { base: CG.common('FormComponentProps'), condition: isFormComponent, evaluator: 'evalFormProps' },
      { base: CG.common('SummarizableComponentProps'), condition: isSummarizable, evaluator: 'evalSummarizable' },
    ];

    const evalLines: string[] = [];
    const itemLine: string[] = [];
    for (const { base, condition, evaluator } of evalCommonProps) {
      if (condition) {
        itemLine.push(`keyof ${base}`);
        evalLines.push(`...props.${evaluator}(),`);
      }
    }

    const pluginInstances = this.plugins.map(
      (plugin) => `protected readonly ${plugin.import} = new ${plugin.import}();`,
    );

    const pluginStateFactories = this.plugins
      .map((plugin) => `...this.${plugin.import}.stateFactory(props),`)
      .join('\n');
    const pluginEvalExpressions = this.plugins
      .map((plugin) => `...this.${plugin.import}.evalDefaultExpressions(props),`)
      .join(',\n');

    const additionalMethods: string[] = [];

    if (!this.config.functionality.customExpressions) {
      additionalMethods.push(
        `// Do not override this one, set functionality.customExpressions to true instead
        evalExpressions(props: ${ExprResolver}<'${this.type}'>) {
          return this.evalDefaultExpressions(props);
        }`,
      );
    }

    const childrenPlugins = this.plugins.filter((plugin) =>
      isNodeStateChildrenPlugin(plugin),
    ) as unknown as (NodeStateChildrenPlugin<any> & NodeStatePlugin<any>)[];

    if (childrenPlugins.length > 0) {
      if (childrenPlugins.length > 1) {
        throw new Error(
          `Component ${symbol} has multiple children plugins. Only one children plugin is allowed per component.`,
        );
      }

      const ItemStore = new CG.import({ import: 'ItemStore', from: 'src/utils/layout/itemState' });
      const ChildLookupRestriction = new CG.import({
        import: 'ChildLookupRestriction',
        from: 'src/utils/layout/HierarchyGenerator',
      });
      const CompTypes = new CG.import({ import: 'CompTypes', from: 'src/layout/layout' });
      const LayoutNode = new CG.import({ import: 'LayoutNode', from: 'src/utils/layout/LayoutNode' });

      const plugin = childrenPlugins[0];
      additionalMethods.push(
        `pickDirectChildren(state: ${ItemStore}<'${this.type}'>, restriction?: ${ChildLookupRestriction} | undefined) {
          return this.${plugin.import}.pickDirectChildren(state, restriction);
        }`,
        `pickChild<C extends ${CompTypes}>(state: ItemStore<'${this.type}'>, childId: string, parentPath: string[]) {
          return this.${plugin.import}.pickChild<C>(state, childId, parentPath);
        }`,
        `addChild(state: ${ItemStore}<'${this.type}'>, childNode: ${LayoutNode}, childStore: ${ItemStore}): void {
          this.${plugin.import}.addChild(state, childNode, childStore);
        }`,
        `removeChild(state: ${ItemStore}<'${this.type}'>, childNode: ${LayoutNode}): void {
          this.${plugin.import}.removeChild(state, childNode);
        }`,
      );
    }

    return `export abstract class ${symbol}Def extends ${categorySymbol}<'${this.type}'> {
      protected readonly type = '${this.type}';
      ${pluginInstances.join('\n')}

      ${this.config.directRendering ? 'directRender(): boolean { return true; }' : ''}

      stateFactory(props: ${StateFactoryProps}<'${this.type}'>) {
        const baseState: ${BaseItemState}<'${this.type}'> = {
          type: 'node',
          item: props.item as unknown as ${CompInternal}<'${this.type}'>,
          layout: props.item,
          hidden: false,
          ready: false,
        };

        return { ...baseState, ${pluginStateFactories} };
      }

      // Do not override this one, set functionality.customExpressions to true instead
      evalDefaultExpressions(props: ${ExprResolver}<'${this.type}'>) {
        return {
          ...props.item as Omit<typeof props.item, ${itemLine.join(' | ')} | 'hidden'>,
          ${evalLines.join('\n')}
          ...props.evalTrb(),${pluginEvalExpressions}
        };
      }

      ${additionalMethods.join('\n\n')}
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
