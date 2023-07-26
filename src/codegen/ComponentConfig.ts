import type { JSONSchema7, JSONSchema7Definition } from 'json-schema';

import { CG } from 'src/codegen/CG';
import { CodeGeneratorContext } from 'src/codegen/CodeGeneratorContext';
import { GenerateExpressionOr } from 'src/codegen/dataTypes/GenerateExpressionOr';
import { GenerateObject } from 'src/codegen/dataTypes/GenerateObject';
import { GenerateUnion } from 'src/codegen/dataTypes/GenerateUnion';
import { ExprVal } from 'src/features/expressions/types';
import { ComponentCategory } from 'src/layout/common';
import type { GenerateImportedSymbol, ImportDef } from 'src/codegen/dataTypes/GenerateImportedSymbol';
import type { GenerateProperty } from 'src/codegen/dataTypes/GenerateProperty';
import type { GenerateTextResourceBinding } from 'src/codegen/dataTypes/GenerateTextResourceBinding';

export interface RequiredComponentConfig {
  category: ComponentCategory;
  rendersWithLabel: boolean;
  capabilities: {
    renderInTable: boolean;
    renderInButtonGroup: boolean;
  };
}

const CategoryImports: { [Category in ComponentCategory]: ImportDef } = {
  [ComponentCategory.Action]: {
    import: 'ActionComponent',
    from: 'src/layout/LayoutComponent',
    jsonSchema: null,
  },
  [ComponentCategory.Form]: {
    import: 'FormComponent',
    from: 'src/layout/LayoutComponent',
    jsonSchema: null,
  },
  [ComponentCategory.Container]: {
    import: 'ContainerComponent',
    from: 'src/layout/LayoutComponent',
    jsonSchema: null,
  },
  [ComponentCategory.Presentation]: {
    import: 'PresentationComponent',
    from: 'src/layout/LayoutComponent',
    jsonSchema: null,
  },
};

export class ComponentConfig {
  public type: string;
  public typeSymbol: string;
  public layoutNodeType = new CG.known('LayoutNode');

  private unresolved = new GenerateObject({
    name: '// TODO: Set name',
    exported: true,
    properties: [],
  });
  private resolved = new GenerateObject({
    name: '// TODO: Set name',
    exported: true,
    properties: [],
  });

  constructor(public readonly config: RequiredComponentConfig) {
    this.addProperty(
      new CG.prop(
        'id',
        new CG.str()
          .setPattern(/^[0-9a-zA-Z][0-9a-zA-Z-]*(-?[a-zA-Z]+|[a-zA-Z][0-9]+|-[0-9]{6,})$/)
          .setTitle('ID')
          .setDescription(
            'The component ID. Must be unique within all layouts/pages in a layout-set. Cannot end with <dash><number>.',
          ),
      ),
    );
    this.addProperty(
      new CG.prop(
        'hidden',
        new CG.expr(ExprVal.Boolean)
          .optional(false)
          .setTitle('Hidden')
          .setDescription(
            'Boolean value or expression indicating if the component should be hidden. Defaults to false.',
          ),
      ),
    );
    this.addProperty(
      new CG.prop(
        'grid',
        new CG.known('IGrid')
          .setTitle('Grid')
          .setDescription('Settings for the components grid. Used for controlling horizontal alignment')
          .optional(),
      ),
    );
    this.addProperty(
      new CG.prop(
        'pageBreak',
        new CG.known('IPageBreak')
          .setTitle('Page break')
          .setDescription('Optionally insert page-break before/after component when rendered in PDF')
          .optional(),
      ),
    );

    if (config.category === ComponentCategory.Form) {
      // TODO: Describe these
      this.addProperty(new CG.prop('readOnly', new CG.expr(ExprVal.Boolean).optional(false)));
      this.addProperty(new CG.prop('required', new CG.expr(ExprVal.Boolean).optional(false)));
      this.addProperty(new CG.prop('triggers', new CG.arr(new CG.known('Triggers')).optional()));

      this.addTextResourcesForSummarizableComponents();
      this.addTextResourcesForFormComponents();
    }
    if (config.category === ComponentCategory.Form || config.category === ComponentCategory.Container) {
      this.addProperty(
        new CG.prop(
          'renderAsSummary',
          new CG.expr(ExprVal.Boolean)
            .optional(false)
            .setTitle('Render as summary')
            .setDescription(
              'Boolean value or expression indicating if the component should be rendered as a summary. Defaults to false.',
            ),
        ),
      );
    }

    if (config.rendersWithLabel) {
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
    this.addProperty(new CG.prop('type', new CG.const(type)).insertAfter('id'));
    this.unresolved.config.name = `ILayoutComp${symbolName}`;
    this.resolved.config.name = `${symbolName}Item`;

    return this;
  }

  public setLayoutNodeType(type: GenerateImportedSymbol<any>): this {
    this.layoutNodeType = type;
    return this;
  }

  public rendersWithLabel(): this {
    // TODO: Describe this
    this.addProperty(new CG.prop('labelSettings', new CG.known('ILabelSettings').optional()));

    return this;
  }

  public addTextResource(arg: GenerateTextResourceBinding): this {
    if (!this.unresolved.getProperty('textResourceBindings')) {
      this.unresolved.addProperty(
        new CG.prop('textResourceBindings', new CG.obj({ inline: true, properties: [] }).optional()),
      );
      this.resolved.addProperty(
        new CG.prop('textResourceBindings', new CG.obj({ inline: true, properties: [] }).optional()),
      );
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
          new CG.arr(new CG.known('IOption').optional())
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
    this.addProperty(
      new CG.prop(
        'mapping',
        new CG.known('IMapping')
          .optional()
          .setTitle('Mapping (when using optionsId)')
          .setDescription('Mapping of data/query-string when fetching from the server'),
      ),
    );
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
    !minimalFunctionality &&
      this.addProperty(
        new CG.prop(
          'source',
          new CG.known('IOptionSource')
            .optional()
            .setTitle('Option source')
            .setDescription('Allows for fetching options from the data model, pointing to a repeating group structure'),
        ),
      );
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
   * TODO: Support required and optional bindings
   */
  public addDataModelBinding(type: 'simple' | 'list' | GenerateImportedSymbol<any>): this {
    const mapping = {
      simple: new CG.known(`IDataModelBindingsSimple`),
      list: new CG.known(`IDataModelBindingsList`),
    };
    const targetType = typeof type === 'string' ? mapping[type] : type;

    const name = 'dataModelBindings';
    const title = 'Data model bindings';
    const description = 'Describes the location in the data model where the component should store its value(s)';
    targetType.setTitle(title).setDescription(description).optional();

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
    CodeGeneratorContext.getInstance().reset();
    const elements = [this.unresolved.toTypeScript(), this.resolved.toTypeScript()];

    const symbol = this.typeSymbol;
    const category = this.config.category;
    const categorySymbol = new CG.import(CategoryImports[category]).toTypeScript();

    elements.push(`export abstract class ${symbol}Def extends ${categorySymbol}<'${this.type}'> {
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
      jsonSchema: null,
    });

    elements.push(`export const Config = {
      def: new ${impl.toTypeScript()}(),
      rendersWithLabel: ${this.config.rendersWithLabel ? 'true' : 'false'} as const,
    }`);

    elements.push(`export type TypeConfig = {
      layout: ILayoutComp${this.typeSymbol};
      nodeItem: ${this.typeSymbol}Item;
      nodeObj: ${this.layoutNodeType.toTypeScript()};
    }`);

    const imports = CodeGeneratorContext.getInstance().getImportsAsTypeScript();
    if (imports) {
      return `${imports}\n\n${elements.join('\n\n')}`;
    }

    return elements.join('\n\n');
  }

  public toJsonSchema(): JSONSchema7Definition {
    return {
      $schema: 'http://json-schema.org/draft-07/schema#',
      ...(this.unresolved.toJsonSchema() as JSONSchema7),
    };
  }
}
