import { CG } from 'src/codegen/CG';
import { ExprVal } from 'src/features/expressions/types';
import type { CodeGenerator } from 'src/codegen/CodeGenerator';

export type ValidCommonKeys =
  | 'IGridSize'
  | 'IGridStyling'
  | 'IGrid'
  | 'IPageBreak'
  | 'Triggers'
  | 'ILabelSettings'
  | 'IDataModelBindingsSimple'
  | 'IDataModelBindingsList'
  | 'IOption'
  | 'IMapping'
  | 'IOptionSource'
  | 'LayoutStyle'
  | 'ITableColumnsAlignText'
  | 'ITableColumnsTextOverflow'
  | 'ITableColumnsProperties';

const makeCommon = (): { [key in ValidCommonKeys]: CodeGenerator<any> } => ({
  IGridSize: new CG.union(new CG.const('auto'), new CG.int().setMin(1).setMax(12)),

  IGridStyling: new CG.obj(
    new CG.prop('xs', new CG.symbol('IGridSize')),
    new CG.prop('sm', new CG.symbol('IGridSize')),
    new CG.prop('md', new CG.symbol('IGridSize')),
    new CG.prop('lg', new CG.symbol('IGridSize')),
    new CG.prop('xl', new CG.symbol('IGridSize')),
  ),

  IGrid: new CG.obj(
    new CG.prop('labelGrid', new CG.symbol('IGridStyling')),
    new CG.prop('innerGrid', new CG.symbol('IGridStyling')),
  )
    .setTitle('Grid')
    .setDescription('Settings for the components grid. Used for controlling horizontal alignment'),

  IPageBreak: new CG.obj(
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

  Triggers: new CG.enum(
    'validation',
    'calculatePageOrder',
    'validatePage',
    'validateCurrentAndPreviousPages',
    'validateAllPages',
    'validateRow',
  ),

  ILabelSettings: new CG.obj(
    new CG.prop(
      'optionalIndicator',
      new CG.bool().setTitle('Optional indicator').setDescription('Show optional indicator on label').optional(),
    ),
  ),

  IDataModelBindingsSimple: new CG.obj(new CG.prop('simpleBinding', new CG.str()))
    .setTitle('Data model binding')
    .setDescription(
      'Describes the location in the data model where the component should store its value(s). A simple ' +
        'binding is used for components that only store a single value, usually a string.',
    ),

  IDataModelBindingsList: new CG.obj(new CG.prop('list', new CG.str()))
    .setTitle('Data model binding')
    .setDescription(
      'Describes the location in the data model where the component should store its value(s). A list binding ' +
        'should be pointed to an array structure in the data model, and is used for components that store multiple ' +
        'simple values (e.g. a list of strings).',
    ),

  IOption: new CG.obj(
    new CG.prop('label', new CG.str()),
    new CG.prop('value', new CG.str()),
    new CG.prop('description', new CG.str().optional()),
    new CG.prop('help', new CG.str().optional()),
  ).addExample({ label: '', value: '' }),

  IMapping: new CG.obj()
    .additionalProperties(new CG.str())
    .setTitle('Mapping')
    .setDescription(
      'A mapping of key-value pairs (usually used for mapping a path in the data model to a query string parameter).',
    ),

  IOptionSource: new CG.obj(
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

  LayoutStyle: new CG.enum('column', 'row', 'table')
    .setTitle('Layout')
    .setDescription('Define the layout style for the options'),

  ITableColumnsAlignText: new CG.enum('left', 'center', 'right')
    .setTitle('Align Text')
    .setDescription(
      "Choose text alignment between 'left', 'center', or 'right' for text in table cells. Defaults to 'left' for text and 'right' for numbers.",
    ),

  ITableColumnsTextOverflow: new CG.obj(
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

  ITableColumnsProperties: new CG.obj(
    new CG.prop(
      'width',
      new CG.str()
        .optional('auto')
        .setTitle('Width')
        .setDescription("Width of cell in % or 'auto'. Defaults to 'auto'")
        .setPattern(/^([0-9]{1,2}%|100%|auto)$/),
    ),
    new CG.prop('alignText', new CG.symbol('ITableColumnsAlignText')),
    new CG.prop('textOverflow', new CG.symbol('ITableColumnsTextOverflow')),
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
});

export function generateCommonDefinitions(): string[] {
  const out: string[] = [];

  for (const key in makeCommon()) {
    const val = makeCommon()[key];
    if (!(val instanceof CG.import)) {
      out.push(`export ${val.toTypeScriptDefinition(key)}`);
    }
  }

  return out;
}
