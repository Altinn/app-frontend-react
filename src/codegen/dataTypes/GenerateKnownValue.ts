import type { JSONSchema7 } from 'json-schema';

import { GenerateEnum } from 'src/codegen/dataTypes/GenerateEnum';
import { GenerateExpressionOr } from 'src/codegen/dataTypes/GenerateExpressionOr';
import { GenerateImportedSymbol } from 'src/codegen/dataTypes/GenerateImportedSymbol';
import { ExprVal } from 'src/features/expressions/types';
import type {
  IDataModelBindingsList,
  IDataModelBindingsSimple,
  IGrid,
  IPageBreak,
  ITableColumnProperties,
} from 'src/layout/layout';
import type { ILabelSettings, IMapping, IOption, IOptionSource, LayoutStyle, Triggers } from 'src/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

const gridSizeSchema: JSONSchema7 = {
  anyOf: [
    {
      type: 'number',
      minimum: 1,
      maximum: 12,
    },
    { const: 'auto' },
  ],
};
const gridStylingSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    xs: gridSizeSchema,
    sm: gridSizeSchema,
    md: gridSizeSchema,
    lg: gridSizeSchema,
    xl: gridSizeSchema,
  },
  additionalProperties: false,
};

export const alignTextSchema: JSONSchema7 = {
  title: 'Align Text',
  description:
    "Choose text alignment between 'left', 'center', or 'right' for text in table cells. Defaults to 'left' for text and 'right' for numbers.",
  type: 'string',
  enum: ['left', 'center', 'right'],
};

export const textOverflowSchema: JSONSchema7 = {
  title: 'Text Overflow',
  description: 'Use this property to controll behaviour when text is too large to be displayed in table cell.',
  properties: {
    lineWrap: {
      title: 'Line Wrap',
      description: 'Toggle line wrapping on or off. Defaults to true',
      type: 'boolean',
    },
    maxHeight: {
      title: 'Max Height',
      description:
        'Determines the number of lines to display in table cell before hiding the rest of the text with an elipsis (...). Defaults to 2.',
      type: 'number',
    },
  },
};

const knownValues = {
  IGrid: {
    type: null as unknown as IGrid,
    import: 'IGrid',
    from: 'src/layout/layout',
    jsonSchema: {
      type: 'object',
      properties: {
        labelGrid: gridStylingSchema,
        innerGrid: gridStylingSchema,
      },
      additionalProperties: false,
    } as JSONSchema7,
  },
  IPageBreak: {
    type: null as unknown as IPageBreak,
    import: 'IPageBreak',
    from: 'src/layout/layout',
    jsonSchema: {
      type: 'object',
      properties: {
        pageBreakBefore: new GenerateExpressionOr(ExprVal.String)
          .setTitle('Page break before')
          .setDescription(
            'PDF only: Value or expression indicating whether a page break should be added before the component. ' +
              "Can be either: 'auto' (default), 'always', or 'avoid'.",
          )
          .addExample('auto', 'always', 'avoid')
          .optional('auto')
          .toJsonSchema(),
        pageBreakAfter: new GenerateExpressionOr(ExprVal.String)
          .setTitle('Page break after')
          .setDescription(
            'PDF only: Value or expression indicating whether a page break should be added after the component. ' +
              "Can be either: 'auto' (default), 'always', or 'avoid'.",
          )
          .addExample('auto', 'always', 'avoid')
          .optional('auto')
          .toJsonSchema(),
      },
    } as JSONSchema7,
  },
  Triggers: {
    type: null as unknown as Triggers,
    import: 'Triggers',
    from: 'src/types/index',
    jsonSchema: new GenerateEnum(
      'validation',
      'calculatePageOrder',
      'validatePage',
      'validateCurrentAndPreviousPages',
      'validateAllPages',
      'validateRow',
    ).toJsonSchema(),
  },
  ILabelSettings: {
    type: null as unknown as ILabelSettings,
    import: 'ILabelSettings',
    from: 'src/types/index',
    jsonSchema: {
      type: 'object',
      properties: {
        optionalIndicator: {
          type: 'boolean',
        },
      },
      additionalProperties: false,
    } as JSONSchema7,
  },
  IDataModelBindingsSimple: {
    type: null as unknown as IDataModelBindingsSimple,
    import: 'IDataModelBindingsSimple',
    from: 'src/layout/layout',
    jsonSchema: {
      type: 'object',
      properties: {
        simpleBinding: { type: 'string' },
      },
      required: ['simpleBinding'],
      additionalProperties: false,
    } as JSONSchema7,
  },
  IDataModelBindingsList: {
    type: null as unknown as IDataModelBindingsList,
    import: 'IDataModelBindingsList',
    from: 'src/layout/layout',
    jsonSchema: {
      type: 'object',
      properties: {
        list: { type: 'string' },
      },
      required: ['list'],
      additionalProperties: false,
    } as JSONSchema7,
  },
  LayoutNode: {
    type: null as unknown as LayoutNode,
    import: 'LayoutNode',
    from: 'src/utils/layout/LayoutNode',
    jsonSchema: null,
  },
  IOption: {
    type: null as unknown as IOption,
    import: 'IOption',
    from: 'src/types/index',
    jsonSchema: {
      type: 'object',
      title: 'Statically defined option',
      properties: {
        label: { type: 'string' },
        value: { type: 'string' },
        description: { type: 'string' },
        help: { type: 'string' },
      },
      required: ['label', 'value'],
      additionalProperties: false,
      examples: [{ label: '', value: '' }],
    } as JSONSchema7,
  },
  IMapping: {
    type: null as unknown as IMapping,
    import: 'IMapping',
    from: 'src/types/index',
    jsonSchema: {
      type: 'object',
      title: 'Mapping',
      additionalProperties: {
        type: 'string',
      },
    } as JSONSchema7,
  },
  IOptionSource: {
    type: null as unknown as IOptionSource,
    import: 'IOptionSource',
    from: 'src/types/index',
    jsonSchema: {
      type: 'object',
      description:
        'Object to define a data model source to be used as basis for options. Can not be used if options or optionId is set. See more on docs: https://docs.altinn.studio/app/development/data/options/',
      properties: {
        group: {
          type: 'string',
          title: 'Group',
          description: 'The repeating group to base options on.',
          examples: ['model.some.group'],
        },
        label: {
          type: 'string',
          title: 'Label',
          description: 'Reference to a text resource to be used as the option label.',
          examples: ['some.text.key'],
        },
        value: {
          type: 'string',
          title: 'Label',
          description: 'Field in the group that should be used as value',
          examples: ['model.some.group[{0}].someField'],
        },
        description: {
          type: 'string',
          title: 'Description',
          description:
            'A description of the option displayed in Radio- and Checkbox groups. Can be plain text or a text resource binding.',
          examples: ['some.text.key', 'My Description'],
        },
        helpText: {
          type: 'string',
          title: 'Help Text',
          description:
            'A help text for the option displayed in Radio- and Checkbox groups. Can be plain text or a text resource binding.',
          examples: ['some.text.key', 'My Help Text'],
        },
      },
      additionalProperties: false,
      required: ['group', 'label', 'value'],
    } as JSONSchema7,
  },
  LayoutStyle: {
    type: null as unknown as LayoutStyle,
    import: 'LayoutStyle',
    from: 'src/types/index',
    jsonSchema: new GenerateEnum('column', 'row', 'table')
      .setTitle('Layout')
      .setDescription('Define the layout style for the options')
      .toJsonSchema(),
  },
  ITableColumnProperties: {
    type: null as unknown as ITableColumnProperties,
    import: 'ITableColumnProperties',
    from: 'src/layout/layout',
    jsonSchema: {
      type: 'object',
      properties: {
        width: {
          title: 'Width',
          description: "Width of cell in % or 'auto'. Defaults to 'auto'",
          type: 'string',
          pattern: '^([0-9]{1,2}%|100%|auto)$',
        },
        alignText: alignTextSchema,
        textOverflow: textOverflowSchema,
      },
      additionalProperties: false,
    } as JSONSchema7,
  },
};

type Map = typeof knownValues;
type KnownValue = keyof Map;
type TypeOfKnownValue<T extends KnownValue> = Map[T]['type'];

export class GenerateKnownValue<T extends KnownValue> extends GenerateImportedSymbol<TypeOfKnownValue<T>> {
  constructor(key: T) {
    const val = knownValues[key];
    super(val);
  }
}
