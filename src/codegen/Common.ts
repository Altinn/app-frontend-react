import type { JSONSchema7 } from 'json-schema';

import { CG } from 'src/codegen/CG';
import { CodeGeneratorContext } from 'src/codegen/CodeGeneratorContext';
import { GenerateObject } from 'src/codegen/dataTypes/GenerateObject';
import { ExprVal } from 'src/features/expressions/types';
import type { CodeGenerator } from 'src/codegen/CodeGenerator';
import type { GenerateProperty } from 'src/codegen/dataTypes/GenerateProperty';

const common = {
  ILabelSettings: () =>
    new CG.obj(
      new CG.prop(
        'optionalIndicator',
        new CG.bool().setTitle('Optional indicator').setDescription('Show optional indicator on label').optional(),
      ),
    ),

  IPageBreak: () =>
    new CG.obj(
      new CG.prop(
        'pageBreakBefore',
        new CG.expr(ExprVal.String)
          .optional('auto')
          .setTitle('Page break before')
          .setDescription(
            'PDF only: Value or expression indicating whether a page break should be added before the component. ' +
              "Can be either: 'auto' (default), 'always', or 'avoid'.",
          )
          .addExample('auto', 'always', 'avoid'),
      ),
      new CG.prop(
        'pageBreakAfter',
        new CG.expr(ExprVal.String)
          .optional('auto')
          .setTitle('Page break after')
          .setDescription(
            'PDF only: Value or expression indicating whether a page break should be added after the component. ' +
              "Can be either: 'auto' (default), 'always', or 'avoid'.",
          )
          .addExample('auto', 'always', 'avoid'),
      ),
    )
      .setTitle('Page break')
      .setDescription('Optionally insert page-break before/after component when rendered in PDF'),

  LayoutStyle: () =>
    new CG.enum('column', 'row', 'table').setTitle('Layout').setDescription('Define the layout style for the options'),

  // Grid styling:
  IGridSize: () => new CG.union(new CG.const('auto'), new CG.int().setMin(1).setMax(12)),
  IGridStyling: () =>
    new CG.obj(
      new CG.prop('xs', CG.common('IGridSize').optional('auto')),
      new CG.prop('sm', CG.common('IGridSize').optional('auto')),
      new CG.prop('md', CG.common('IGridSize').optional('auto')),
      new CG.prop('lg', CG.common('IGridSize').optional('auto')),
      new CG.prop('xl', CG.common('IGridSize').optional('auto')),
    ),
  IGrid: () =>
    new CG.obj(
      new CG.prop('labelGrid', CG.common('IGridStyling').optional()),
      new CG.prop('innerGrid', CG.common('IGridStyling').optional()),
    )
      .extends(CG.common('IGridStyling'))
      .setTitle('Grid')
      .setDescription('Settings for the components grid. Used for controlling horizontal alignment'),

  // Triggers on components:
  Triggers: () =>
    new CG.enum(
      'validation',
      'calculatePageOrder',
      'validatePage',
      'validateCurrentAndPreviousPages',
      'validateAllPages',
      'validateRow',
    ),
  TriggerList: () =>
    new CG.arr(CG.common('Triggers'))
      .setTitle('Triggers')
      .setDescription('List of actions to trigger when the user interacts with the component'),

  // Panel display mode:
  IPanelBase: () =>
    new CG.obj(
      new CG.prop('variant', new CG.enum('info', 'warning', 'error', 'success').optional()),
      new CG.prop('showIcon', new CG.bool().optional()),
    ),

  // Data model bindings:
  IDataModelBindingsSimple: () =>
    new CG.obj(new CG.prop('simpleBinding', new CG.str()))
      .setTitle('Data model binding')
      .setDescription(
        'Describes the location in the data model where the component should store its value(s). A simple ' +
          'binding is used for components that only store a single value, usually a string.',
      ),
  IDataModelBindingsList: () =>
    new CG.obj(new CG.prop('list', new CG.str()))
      .setTitle('Data model binding')
      .setDescription(
        'Describes the location in the data model where the component should store its value(s). A list binding ' +
          'should be pointed to an array structure in the data model, and is used for components that store multiple ' +
          'simple values (e.g. a list of strings).',
      ),

  // Text resource bindings:
  TRBSummarizable: () =>
    makeTRB({
      summaryTitle: {
        title: 'Summary title',
        description: 'Title used in the summary view (overrides the default title)',
      },
      summaryAccessibleTitle: {
        title: 'Accessible summary title',
        description:
          'Title used for aria-label on the edit button in the summary view (overrides the default and summary title)',
      },
    }),
  TRBFormComp: () =>
    makeTRB({
      tableTitle: {
        title: 'Table title',
        description: 'Title used in the table view (overrides the default title)',
      },
      shortName: {
        title: 'Short name (for validation)',
        description: 'Alternative name used for required validation messages (overrides the default title)',
      },
    }),
  TRBLabel: () =>
    makeTRB({
      title: {
        title: 'Title',
        description: 'Label text/title shown above the component',
      },
      description: {
        title: 'Description',
        description: 'Label description shown above the component, below the title',
      },
      help: {
        title: 'Help text',
        description: 'Help text shown in a tooltip when clicking the help button',
      },
    }),

  // Options/code lists:
  IOption: () =>
    new CG.obj(
      new CG.prop('label', new CG.str()),
      new CG.prop('value', new CG.str()),
      new CG.prop('description', new CG.str().optional()),
      new CG.prop('help', new CG.str().optional()),
    ).addExample({ label: '', value: '' }),
  IMapping: () =>
    new CG.obj()
      .additionalProperties(new CG.str())
      .setTitle('Mapping')
      .setDescription(
        'A mapping of key-value pairs (usually used for mapping a path in the data model to a query string parameter).',
      ),
  IOptionSource: () =>
    new CG.obj(
      new CG.prop(
        'group',
        new CG.str()
          .setTitle('Group')
          .setDescription('The repeating group to base options on.')
          .addExample('model.some.group'),
      ),
      new CG.prop(
        'label',
        new CG.str()
          .setTitle('Label')
          .setDescription('Reference to a text resource to be used as the option label.')
          .addExample('some.text.key'),
      ),
      new CG.prop(
        'value',
        new CG.str()
          .setTitle('Value')
          .setDescription('Field in the group that should be used as value')
          .addExample('model.some.group[{0}].someField'),
      ),
      new CG.prop(
        'description',
        new CG.str()
          .optional()
          .setTitle('Description')
          .setDescription(
            'A description of the option displayed in Radio- and Checkbox groups. Can be plain text or a text resource binding.',
          )
          .addExample('some.text.key', 'My Description'),
      ),
      new CG.prop(
        'helpText',
        new CG.str()
          .optional()
          .setTitle('Help Text')
          .setDescription(
            'A help text for the option displayed in Radio- and Checkbox groups. Can be plain text or a text resource binding.',
          )
          .addExample('some.text.key', 'My Help Text'),
      ),
    )
      .setTitle('Option source')
      .setDescription('Allows for fetching options from the data model, pointing to a repeating group structure'),
  ISelectionComponentMinimal: () =>
    new CG.obj(
      new CG.prop(
        'optionsId',
        new CG.str()
          .optional()
          .setTitle('Dynamic options (fetched from server)')
          .setDescription('ID of the option list to fetch from the server'),
      ),
      new CG.prop('mapping', CG.common('IMapping').optional()),
    ),
  ISelectionComponent: () =>
    new CG.obj(
      new CG.prop(
        'options',
        new CG.arr(CG.common('IOption').optional()).setTitle('Static options').setDescription('List of static options'),
      ),
      new CG.prop(
        'secure',
        new CG.bool()
          .optional(false)
          .setTitle('Secure options (when using optionsId)')
          .setDescription(
            'Whether to call the secure API endpoint when fetching options from the ' +
              'server (allows for user/instance-specific options)',
          ),
      ),
      new CG.prop('source', CG.common('IOptionSource').optional()),
      new CG.prop(
        'preselectedOptionIndex',
        new CG.int()
          .optional()
          .setTitle('Preselected option index')
          .setDescription('Index of the option to preselect (if no option has been selected yet)'),
      ),
    ).extends(CG.common('ISelectionComponentMinimal')),

  // Table configuration:
  ITableColumnsAlignText: () =>
    new CG.enum('left', 'center', 'right')
      .setTitle('Align Text')
      .setDescription(
        "Choose text alignment between 'left', 'center', or 'right' for text in table cells. Defaults to 'left' for text and 'right' for numbers.",
      ),
  ITableColumnsTextOverflow: () =>
    new CG.obj(
      new CG.prop(
        'lineWrap',
        new CG.bool()
          .optional(true)
          .setTitle('Line Wrap')
          .setDescription('Toggle line wrapping on or off. Defaults to true'),
      ),
      new CG.prop(
        'maxHeight',
        new CG.num()
          .optional(2)
          .setTitle('Max Height')
          .setDescription(
            'Determines the number of lines to display in table cell before hiding the rest of the ' +
              'text with an ellipsis (...). Defaults to 2.',
          ),
      ),
    ),
  ITableColumnsProperties: () =>
    new CG.obj(
      new CG.prop(
        'width',
        new CG.str()
          .optional('auto')
          .setTitle('Width')
          .setDescription("Width of cell in % or 'auto'. Defaults to 'auto'")
          .setPattern(/^([0-9]{1,2}%|100%|auto)$/),
      ),
      new CG.prop('alignText', CG.common('ITableColumnsAlignText')),
      new CG.prop('textOverflow', CG.common('ITableColumnsTextOverflow')),
    )
      .setTitle('Column options')
      .setDescription('Options for the row/column')
      .addExample({
        width: 'auto',
        alignText: 'left',
        textOverflow: {
          lineWrap: true,
          maxHeight: 2,
        },
      }),

  // Types that unresolved/resolved component definitions extend:
  ComponentBase: () =>
    new CG.obj(
      new CG.prop(
        'id',
        new CG.str()
          .setPattern(/^[0-9a-zA-Z][0-9a-zA-Z-]*(-?[a-zA-Z]+|[a-zA-Z][0-9]+|-[0-9]{6,})$/)
          .setTitle('ID')
          .setDescription(
            'The component ID. Must be unique within all layouts/pages in a layout-set. Cannot end with <dash><number>.',
          ),
      ),
      new CG.prop(
        'hidden',
        new CG.expr(ExprVal.Boolean)
          .optional(false)
          .setTitle('Hidden')
          .setDescription(
            'Boolean value or expression indicating if the component should be hidden. Defaults to false.',
          ),
      ),
      new CG.prop('grid', CG.common('IGrid').optional()),
      new CG.prop('pageBreak', CG.common('IPageBreak').optional()),
    ),
  FormComponentProps: () =>
    new CG.obj(
      new CG.prop(
        'readOnly',
        new CG.expr(ExprVal.Boolean)
          .optional(false)
          .setTitle('Read only/disabled?')
          .setDescription(
            'Boolean value or expression indicating if the component should be read only/disabled. Defaults to false.',
          ),
      ),
      new CG.prop(
        'required',
        new CG.expr(ExprVal.Boolean)
          .optional(false)
          .setTitle('Required?')
          .setDescription(
            'Boolean value or expression indicating if the component should be required. Defaults to false.',
          ),
      ),
      new CG.prop('triggers', CG.common('TriggerList').optional()),
    ),
  SummarizableComponentProps: () =>
    new CG.obj(
      new CG.prop(
        'renderAsSummary',
        new CG.expr(ExprVal.Boolean)
          .optional(false)
          .setTitle('Render as summary')
          .setDescription(
            'Boolean value or expression indicating if the component should be rendered as a summary. Defaults to false.',
          ),
      ),
    ),
  LabeledComponentProps: () => new CG.obj(new CG.prop('labelSettings', CG.common('ILabelSettings').optional())),
};

export type ValidCommonKeys = keyof typeof common;

interface TRB {
  title: string;
  description: string;
}

function makeTRB(keys: { [key: string]: TRB }) {
  const obj = new CG.obj();
  for (const prop in keys) {
    const val = keys[prop];
    obj.addProperty(
      new CG.prop(prop, new CG.expr(ExprVal.String).optional().setTitle(val.title).setDescription(val.description)),
    );
  }
  return obj;
}

const containsExprCache: { [key in ValidCommonKeys]?: boolean } = {};

export function isCommonKey(key: string): key is ValidCommonKeys {
  return key in common;
}

export function commonContainsExpressions(key: ValidCommonKeys): boolean {
  if (!isCommonKey(key)) {
    return false;
  }

  if (containsExprCache[key] === undefined) {
    CodeGeneratorContext.generateTypeScript(() => {
      containsExprCache[key] = common[key]().containsExpressions();
      return '';
    }, 'unresolved');
  }
  return containsExprCache[key]!;
}

export function generateCommonTypeScript(): string[] {
  const out: string[] = [];

  for (const key in common) {
    if (commonContainsExpressions(key as ValidCommonKeys)) {
      const unresolved = CodeGeneratorContext.generateTypeScript(() => {
        const val = common[key]();
        return val._toTypeScriptDefinition(`${key}Unresolved`);
      }, 'unresolved');
      const resolved = CodeGeneratorContext.generateTypeScript(() => {
        const val = common[key]();
        return val.transformToResolved()._toTypeScriptDefinition(`${key}Resolved`);
      }, 'resolved');
      out.push(`export ${unresolved.result}\n`);
      out.push(`export ${resolved.result}\n`);
    } else {
      const unresolved = CodeGeneratorContext.generateTypeScript(() => {
        const val = common[key]();
        return val._toTypeScriptDefinition(key);
      }, 'unresolved');

      out.push(`export ${unresolved.result}\n`);
    }
  }

  return out;
}

export function generateCommonSchema(): { [key in ValidCommonKeys]: JSONSchema7 } {
  const out: { [key: string]: JSONSchema7 } = {};

  for (const key in common) {
    const val: CodeGenerator<any> = common[key]();

    if (val instanceof GenerateObject) {
      // We need to set this to undefined for common objects, because we have to collect all properties in one single
      // object when extending multiple objects, and the last object will then collect all properties and
      // set additionalProperties to false in order to not have conflicts in JsonSchema where multiple objects
      // define additionalProperties = false and mutually exclusive properties.
      val.additionalProperties(undefined);
    }

    if (commonContainsExpressions(key as ValidCommonKeys)) {
      out[`${key}Unresolved`] = val.toJsonSchema();
      out[`${key}Resolved`] = val.transformToResolved().toJsonSchema();
    } else {
      out[key] = val.toJsonSchema();
    }
  }

  return out as { [key in ValidCommonKeys]: JSONSchema7 };
}

export function getPropertiesFor(key: ValidCommonKeys): GenerateProperty<any>[] {
  const val = common[key]();
  if (val instanceof GenerateObject) {
    return val.getProperties();
  }

  throw new Error(`No properties for ${key}, it is of type ${val.constructor.name}`);
}

export function getCommonRealName(key: ValidCommonKeys): string {
  if (CodeGeneratorContext.hasTypeScriptInstance() && commonContainsExpressions(key) && key in common) {
    const suffix = CodeGeneratorContext.getTypeScriptInstance().variant === 'resolved' ? 'Resolved' : 'Unresolved';
    return `${key}${suffix}`;
  }

  return key;
}
