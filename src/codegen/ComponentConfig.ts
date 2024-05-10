import type { JSONSchema7 } from 'json-schema';

import { CG } from 'src/codegen/CG';
import { LabelRendering } from 'src/codegen/Config';
import { GenerateImportedSymbol } from 'src/codegen/dataTypes/GenerateImportedSymbol';
import { GenerateRaw } from 'src/codegen/dataTypes/GenerateRaw';
import { GenerateUnion } from 'src/codegen/dataTypes/GenerateUnion';
import { ValidationPlugin } from 'src/features/validation/ValidationPlugin';
import { CompCategory } from 'src/layout/common';
import { isNodeDefChildrenPlugin, NodeDefPlugin } from 'src/utils/layout/plugins/NodeDefPlugin';
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
import type { NodeDefChildrenPlugin } from 'src/utils/layout/plugins/NodeDefPlugin';

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
  protected plugins: NodeDefPlugin<any>[] = [];

  constructor(public readonly config: RequiredComponentConfig) {
    this.inner.extends(CG.common('ComponentBase'));

    if (config.category === CompCategory.Form) {
      this.inner.extends(CG.common('FormComponentProps'));
      this.extendTextResources(CG.common('TRBFormComp'));
    }
    if (this.isFormLike()) {
      this.inner.extends(CG.common('SummarizableComponentProps'));
      this.extendTextResources(CG.common('TRBSummarizable'));
      this.behaviors.isSummarizable = true;
      this.addPlugin(new ValidationPlugin());
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

  public addPlugin(plugin: NodeDefPlugin<any>): this {
    for (const existing of this.plugins) {
      if (existing.getKey() === plugin.getKey()) {
        throw new Error(`Component already has a plugin with the key ${plugin.getKey()}!`);
      }
    }

    plugin.addToComponent(this);
    this.plugins.push(plugin);
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

  public isFormLike(): boolean {
    return this.config.category === CompCategory.Form || this.config.category === CompCategory.Container;
  }

  private hasDataModelBindings(): boolean {
    const prop = this.inner.getProperty('dataModelBindings');
    return this.isFormLike() && prop !== undefined && !(prop.type instanceof GenerateRaw);
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
    if (!this.isFormLike()) {
      throw new Error(
        `Component wants dataModelBindings, but is not a form nor a container component. ` +
          `Only these categories can have data model bindings.`,
      );
    }

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

    const pluginUnion =
      this.plugins.length === 0
        ? 'never'
        : this.plugins
            .map((plugin) => {
              const PluginName = plugin.makeImport();
              const genericArgs = plugin.makeGenericArgs();
              return genericArgs ? `${PluginName}<${genericArgs}>` : `${PluginName}`;
            })
            .join(' | ');

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
         plugins: ${pluginUnion};
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
      from: 'src/utils/layout/types',
    });

    const BaseItemState = new CG.import({
      import: 'BaseItemState',
      from: 'src/utils/layout/types',
    });

    const CompInternal = new CG.import({
      import: 'CompInternal',
      from: 'src/layout/layout',
    });

    const ExprResolver = new CG.import({
      import: 'ExprResolver',
      from: 'src/layout/LayoutComponent',
    });

    const NodeGeneratorProps = new CG.import({
      import: 'NodeGeneratorProps',
      from: 'src/layout/LayoutComponent',
    });

    const ReactJSX = new CG.import({
      import: 'JSX',
      from: 'react',
    });

    const NodeGenerator = new CG.import({
      import: 'NodeGenerator',
      from: 'src/utils/layout/NodeGenerator',
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

    const pluginInstances = this.plugins.map((plugin) => {
      const args = plugin.makeConstructorArgs();
      const instance = `new ${plugin.import}(${args})`;
      return `'${plugin.getKey()}': ${instance}`;
    });
    const pluginMap = pluginInstances.length ? `protected plugins = {${pluginInstances.join(',\n')}};` : '';

    function pluginRef(plugin: NodeDefPlugin<any>): string {
      return `this.plugins['${plugin.getKey()}']`;
    }

    const pluginStateFactories = this.plugins
      .filter((plugin) => plugin.stateFactory !== NodeDefPlugin.prototype.stateFactory)
      .map((plugin) => `...${pluginRef(plugin)}.stateFactory(props as any),`)
      .join('\n');

    const pluginEvalExpressions = this.plugins
      .filter((plugin) => plugin.evalDefaultExpressions !== NodeDefPlugin.prototype.evalDefaultExpressions)
      .map((plugin) => `...${pluginRef(plugin)}.evalDefaultExpressions(props as any),`)
      .join(',\n');

    const pluginGeneratorChildren = this.plugins
      .filter((plugin) => plugin.extraNodeGeneratorChildren !== NodeDefPlugin.prototype.extraNodeGeneratorChildren)
      .map((plugin) => plugin.extraNodeGeneratorChildren())
      .join('\n');

    const additionalMethods: string[] = [];

    if (!this.config.functionality.customExpressions) {
      additionalMethods.push(
        `// Do not override this one, set functionality.customExpressions to true instead
        evalExpressions(props: ${ExprResolver}<'${this.type}'>) {
          return this.evalDefaultExpressions(props);
        }`,
      );
    }

    if (this.hasDataModelBindings()) {
      const LayoutValidationCtx = new CG.import({
        import: 'LayoutValidationCtx',
        from: 'src/features/devtools/layoutValidation/types',
      });
      additionalMethods.push(
        `// You must implement this because the component has data model bindings defined
        abstract validateDataModelBindings(ctx: ${LayoutValidationCtx}<'${this.type}'>): string[];`,
      );
    } else if (this.isFormLike()) {
      additionalMethods.push(
        `// This component could have, but does not have any data model bindings defined
        getDisplayData() { return ''; }`,
      );
    }

    for (const plugin of this.plugins) {
      const extraMethodsFromPlugin = plugin.extraMethodsInDef();
      additionalMethods.push(...extraMethodsFromPlugin);
    }

    const childrenPlugins = this.plugins.filter((plugin) =>
      isNodeDefChildrenPlugin(plugin),
    ) as unknown as (NodeDefChildrenPlugin<any> & NodeDefPlugin<any>)[];

    if (childrenPlugins.length > 0) {
      if (childrenPlugins.length > 1) {
        throw new Error(
          `Component ${symbol} has multiple children plugins. Only one children plugin is allowed per component.`,
        );
      }

      const ChildClaimerProps = new CG.import({ import: 'ChildClaimerProps', from: 'src/layout/LayoutComponent' });
      const NodeData = new CG.import({ import: 'NodeData', from: 'src/utils/layout/types' });
      const ChildLookupRestriction = new CG.import({
        import: 'ChildLookupRestriction',
        from: 'src/utils/layout/useNodeTraversal',
      });
      const CompTypes = new CG.import({ import: 'CompTypes', from: 'src/layout/layout' });
      const LayoutNode = new CG.import({ import: 'LayoutNode', from: 'src/utils/layout/LayoutNode' });

      const plugin = childrenPlugins[0];
      additionalMethods.push(
        `claimChildren(props: ${ChildClaimerProps}<'${this.type}'>) {
          return ${pluginRef(plugin)}.claimChildren(props as any);
        }`,
        `pickDirectChildren(state: ${NodeData}<'${this.type}'>, restriction?: ${ChildLookupRestriction}) {
          return ${pluginRef(plugin)}.pickDirectChildren(state as any, restriction);
        }`,
        `pickChild<C extends ${CompTypes}>(state: ${NodeData}<'${this.type}'>, childId: string, parentPath: string[]) {
          return ${pluginRef(plugin)}.pickChild<C>(state as any, childId, parentPath);
        }`,
        `addChild(state: ${NodeData}<'${this.type}'>, childNode: ${LayoutNode}, childStore: ${NodeData}): void {
          ${pluginRef(plugin)}.addChild(state as any, childNode, childStore);
        }`,
        `removeChild(state: ${NodeData}<'${this.type}'>, childNode: ${LayoutNode}): void {
          ${pluginRef(plugin)}.removeChild(state as any, childNode);
        }`,
      );
    }

    return `export abstract class ${symbol}Def extends ${categorySymbol}<'${this.type}'> {
      protected readonly type = '${this.type}';
      ${pluginMap}

      ${this.config.directRendering ? 'directRender(): boolean { return true; }' : ''}

      renderNodeGenerator(props: ${NodeGeneratorProps}<'${this.type}'>): ${ReactJSX}.Element | null {
        return (
          <${NodeGenerator} {...props}>
            ${pluginGeneratorChildren}
          </${NodeGenerator}>
        );
      }

      stateFactory(props: ${StateFactoryProps}<'${this.type}'>) {
        const baseState: ${BaseItemState}<'${this.type}'> = {
          type: 'node',
          item: props.item as unknown as ${CompInternal}<'${this.type}'>,
          layout: props.item,
          hidden: undefined,
          row: props.row,
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
