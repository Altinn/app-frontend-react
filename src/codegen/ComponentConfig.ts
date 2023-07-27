import type { JSONSchema7, JSONSchema7Definition } from 'json-schema';

import { CG } from 'src/codegen/CG';
import { GenerateExpressionOr } from 'src/codegen/dataTypes/GenerateExpressionOr';
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

  // PRIORITY: Extend a different base component for resolved components
  private unresolved = new CG.obj().extends(CG.common('ILayoutCompBase'));
  private resolved = new CG.obj().extends(CG.common('ILayoutCompBase'));

  constructor(public readonly config: RequiredComponentConfig) {
    if (config.category === ComponentCategory.Form) {
      this.unresolved.extends(CG.common('ILayoutCompForm'));

      this.addTextResourcesForSummarizableComponents();
      this.addTextResourcesForFormComponents();
    }
    if (config.category === ComponentCategory.Form || config.category === ComponentCategory.Container) {
      this.unresolved.extends(CG.common('ILayoutCompSummarizable'));
    }

    if (config.rendersWithLabel) {
      this.rendersWithLabel();
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

    if (prop.type instanceof GenerateExpressionOr) {
      const newProp = new CG.prop(prop.name, prop.type.getTargetType());
      this.resolved.addProperty(newProp);
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

  private rendersWithLabel(): this {
    this.unresolved.extends(CG.common('ILayoutCompWithLabel'));
    this.resolved.extends(CG.common('ILayoutCompWithLabel'));

    return this;
  }

  public addTextResource(arg: GenerateTextResourceBinding): this {
    if (!this.unresolved.getProperty('textResourceBindings')) {
      this.unresolved.addProperty(new CG.prop('textResourceBindings', new CG.obj().optional()));
      this.resolved.addProperty(new CG.prop('textResourceBindings', new CG.obj().optional()));
    }

    for (const targetObject of [this.unresolved, this.resolved]) {
      const bindings = targetObject.getProperty('textResourceBindings')?.type;
      if (bindings instanceof GenerateObject) {
        if (targetObject === this.unresolved) {
          bindings.addProperty(arg);
        } else {
          bindings.addProperty(arg.asResolved());
        }
      }
    }

    return this;
  }

  private addTextResourcesForSummarizableComponents(): this {
    return this.addTextResource(
      new CG.trb({
        name: 'summaryTitle',
        title: 'Summary title',
        description: 'Title used in the summary view (overrides the default title)',
      }),
    ).addTextResource(
      new CG.trb({
        name: 'summaryAccessibleTitle',
        title: 'Accessible summary title',
        description:
          'Title used for aria-label on the edit button in the summary view (overrides the default and summary title)',
      }),
    );
  }

  private addTextResourcesForFormComponents(): this {
    return this.addTextResource(
      new CG.trb({
        name: 'tableTitle',
        title: 'Table title',
        description: 'Title used in the table view (overrides the default title)',
      }),
    ).addTextResource(
      new CG.trb({
        name: 'shortName',
        title: 'Short name (for validation)',
        description: 'Alternative name used for required validation messages (overrides the default title)',
      }),
    );
  }

  public addTextResourcesForLabel(): this {
    return this.addTextResource(
      new CG.trb({
        name: 'title',
        title: 'Title',
        description: 'Label text/title shown above the component',
      }),
    )
      .addTextResource(
        new CG.trb({
          name: 'description',
          title: 'Description',
          description: 'Label description shown above the component, below the title',
        }),
      )
      .addTextResource(
        new CG.trb({
          name: 'help',
          title: 'Help text',
          description: 'Help text shown in a tooltip when clicking the help button',
        }),
      );
  }

  public makeSelectionComponent(minimalFunctionality = false): this {
    !minimalFunctionality &&
      this.addProperty(
        new CG.prop(
          'options',
          new CG.arr(CG.common('IOption').optional())
            .setTitle('Static options')
            .setDescription('List of static options'),
        ),
      );
    this.addProperty(
      new CG.prop(
        'optionsId',
        new CG.str()
          .optional()
          .setTitle('Dynamic options (fetched from server)')
          .setDescription('ID of the option list to fetch from the server'),
      ),
    );
    this.addProperty(new CG.prop('mapping', CG.common('IMapping').optional()));
    !minimalFunctionality &&
      this.addProperty(
        new CG.prop(
          'secure',
          new CG.bool()
            .optional(false)
            .setTitle('Secure options (when using optionsId)')
            .setDescription(
              'Whether to call the secure API endpoint when fetching options from the server (allows for user/instance-specific options)',
            ),
        ),
      );
    !minimalFunctionality && this.addProperty(new CG.prop('source', CG.common('IOptionSource').optional()));
    !minimalFunctionality &&
      this.addProperty(
        new CG.prop(
          'preselectedOptionIndex',
          new CG.int()
            .optional()
            .setTitle('Preselected option index')
            .setDescription('Index of the option to preselect (if no option has been selected yet)'),
        ),
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
    this.unresolved.setSymbol({
      name: `ILayoutComp${this.typeSymbol}`,
      exported: true,
    });
    this.resolved.setSymbol({
      name: `${this.typeSymbol}Item`,
      exported: true,
    });

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

  public toJsonSchema(): JSONSchema7Definition {
    return {
      $schema: 'http://json-schema.org/draft-07/schema#',
      ...(this.unresolved.toJsonSchema() as JSONSchema7),
    };
  }
}
