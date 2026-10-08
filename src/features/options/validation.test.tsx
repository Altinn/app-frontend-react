import { renderHook } from '@testing-library/react';
import type { JSONSchema7 } from 'json-schema';

import { DataModels } from 'src/features/datamodel/DataModelsProvider';
import { SchemaLookupTool } from 'src/features/datamodel/useDataModelSchemaQuery';
import * as LayoutsContext from 'src/features/form/layout/LayoutsContext';
import { makeLayoutLookups } from 'src/features/form/layout/makeLayoutLookups';
import { validateOptionsDataModelBindings } from 'src/features/options/validation';
import { useValidateSimpleBindingWithOptionalGroup } from 'src/features/saveToGroup/layoutValidation';
import { Checkboxes } from 'src/layout/Checkboxes';
import { Dropdown } from 'src/layout/Dropdown';
import { LikertItem } from 'src/layout/LikertItem';
import { MultipleSelect } from 'src/layout/MultipleSelect';
import { RadioButtons } from 'src/layout/RadioButtons';
import type { OptionsValueType } from 'src/features/options/useGetOptions';
import type { IDataModelReference } from 'src/layout/common.generated';
import type { IDataModelBindings } from 'src/layout/layout';

const reference = (field: string): IDataModelReference => ({ field, dataType: 'model' });
const bindings: IDataModelBindings<'Checkboxes'> = {
  simpleBinding: reference('Value'),
  label: reference('Label'),
  metadata: reference('Metadata'),
};
const layoutLookups = makeLayoutLookups({
  page: [{ id: 'choice', type: 'Checkboxes', dataModelBindings: bindings }],
});

function makeLookup(label: JSONSchema7, metadata: JSONSchema7 = { type: 'string' }) {
  const tool = new SchemaLookupTool(
    {
      type: 'object',
      properties: {
        Value: { type: 'string' },
        Label: label,
        Metadata: metadata,
        Group: {
          type: 'array',
          items: { type: 'object', properties: { Value: { type: 'string' }, Label: label } },
        },
      },
      definitions: { Text: { type: 'string' } },
    },
    '',
  );
  return (binding: IDataModelReference) => tool.getSchemaForPath(binding.field);
}

function validate(label: JSONSchema7, valueType: OptionsValueType, metadata?: JSONSchema7) {
  return validateOptionsDataModelBindings('choice', bindings, makeLookup(label, metadata), layoutLookups, valueType);
}

const initialValidationSetting = window.forceNodePropertiesValidation;
beforeEach(() => {
  window.forceNodePropertiesValidation = undefined;
});
afterEach(() => {
  window.forceNodePropertiesValidation = initialValidationSetting;
  jest.restoreAllMocks();
});

describe('options binding validation', () => {
  it('accepts optional bindings being absent and schemas not yet loaded', () => {
    expect(validateOptionsDataModelBindings('choice', undefined, undefined, layoutLookups, 'multi')).toEqual([]);
    expect(validateOptionsDataModelBindings('choice', bindings, undefined, layoutLookups, 'multi')).toEqual([]);
    expect(
      validateOptionsDataModelBindings(
        'choice',
        { simpleBinding: bindings.simpleBinding },
        makeLookup({ type: 'string' }),
        layoutLookups,
        'multi',
      ),
    ).toEqual([]);
  });

  it('accepts string labels for single selection', () => {
    expect(validate({ type: 'string' }, 'single')).toEqual([]);
  });

  it('rejects array labels for single selection', () => {
    expect(validate({ type: 'array', items: { type: 'string' } }, 'single')).toEqual([
      expect.stringContaining('label-datamodellbindingen'),
    ]);
  });

  it('accepts string arrays for multiple selection', () => {
    expect(validate({ type: 'array', items: { type: 'string' } }, 'multi')).toEqual([]);
  });

  it('resolves references and nullable string array items', () => {
    expect(validate({ type: 'array', items: { $ref: '#/definitions/Text' } }, 'multi')).toEqual([]);
    expect(validate({ type: 'array', items: { type: ['string', 'null'] } }, 'multi')).toEqual([]);
  });

  it('rejects scalar labels for multiple selection', () => {
    expect(validate({ type: 'string' }, 'multi')).toEqual([expect.stringContaining('label-datamodellbindingen')]);
  });

  it.each<JSONSchema7>([
    { type: 'array', items: { type: 'number' } },
    { type: 'array', items: { type: 'object' } },
    { type: 'array' },
  ])('rejects arrays without string items: %j', (schema) => {
    expect(validate(schema, 'multi')).toEqual([expect.stringContaining('label')]);
  });

  it.each<JSONSchema7>([{ type: 'number' }, { type: 'array', items: { type: 'string' } }])(
    'rejects non-string metadata: %j',
    (schema) => {
      expect(validate({ type: 'string' }, 'single', schema)).toEqual([
        expect.stringContaining('metadata-datamodellbindingen'),
      ]);
    },
  );

  it.each(['label', 'metadata'] as const)('reports missing fields for %s', (key) => {
    const errors = validateOptionsDataModelBindings(
      'choice',
      { ...bindings, [key]: reference('Missing') },
      makeLookup({ type: 'array', items: { type: 'string' } }),
      layoutLookups,
      'multi',
    );
    expect(errors).toEqual([expect.stringContaining('Missing')]);
  });

  it('honours disabled layout validation', () => {
    window.forceNodePropertiesValidation = 'off';
    try {
      expect(validate({ type: 'number' }, 'multi', { type: 'number' })).toEqual([]);
    } finally {
      window.forceNodePropertiesValidation = undefined;
    }
  });
});

describe('component binding validators', () => {
  it('checks label and metadata bindings in LikertItem', () => {
    jest.spyOn(DataModels, 'useLookupBinding').mockReturnValue(makeLookup({ type: 'number' }, { type: 'number' }));
    jest.spyOn(LayoutsContext, 'useLayoutLookups').mockReturnValue({
      ...layoutLookups,
      allComponents: {
        ...layoutLookups.allComponents,
        likert: {
          id: 'likert',
          type: 'Likert',
          dataModelBindings: { questions: reference('Group'), answer: reference('Group.Value') },
        },
      },
      componentToParent: { ...layoutLookups.componentToParent, choice: { type: 'node', id: 'likert' } },
    });
    const { result } = renderHook(() =>
      new LikertItem().useDataModelBindingValidation('choice', {
        simpleBinding: reference('Group[0].Value'),
        label: reference('Group[0].Label'),
        metadata: reference('Metadata'),
      }),
    );
    expect(result.current).toEqual([
      expect.stringContaining('metadata-datamodellbindingen'),
      expect.stringContaining('label-datamodellbindingen'),
    ]);
  });

  it.each([
    ['Dropdown', new Dropdown()],
    ['RadioButtons', new RadioButtons()],
    ['Checkboxes', new Checkboxes()],
    ['MultipleSelect', new MultipleSelect()],
  ] as const)('checks label and metadata bindings in %s', (_, component) => {
    jest.spyOn(DataModels, 'useLookupBinding').mockReturnValue(makeLookup({ type: 'number' }, { type: 'number' }));
    jest.spyOn(LayoutsContext, 'useLayoutLookups').mockReturnValue(layoutLookups);
    const { result } = renderHook(() => component.useDataModelBindingValidation('choice', bindings));
    expect(result.current).toEqual([
      expect.stringContaining('metadata-datamodellbindingen'),
      expect.stringContaining('label-datamodellbindingen'),
    ]);
  });

  it('rejects grouped labels bound to a different data model despite matching field paths and types', () => {
    jest.spyOn(DataModels, 'useLookupBinding').mockReturnValue(makeLookup({ type: 'string' }));
    jest.spyOn(LayoutsContext, 'useLayoutLookups').mockReturnValue(layoutLookups);
    const { result } = renderHook(() =>
      useValidateSimpleBindingWithOptionalGroup('choice', {
        group: reference('Group'),
        simpleBinding: reference('Group.Value'),
        label: { field: 'Group.Label', dataType: 'otherModel' },
      }),
    );
    expect(result.current).toEqual(['label must use the group binding data type']);
  });

  it.each([
    [{ type: 'string' }, []],
    [{ type: 'array', items: { type: 'string' } }, [expect.stringContaining('label-datamodellbindingen')]],
  ] satisfies [JSONSchema7, unknown[]][])(
    'validates labels as scalar strings inside group rows: %j',
    (schema, errors) => {
      jest.spyOn(DataModels, 'useLookupBinding').mockReturnValue(makeLookup(schema));
      jest.spyOn(LayoutsContext, 'useLayoutLookups').mockReturnValue(layoutLookups);
      const { result } = renderHook(() =>
        useValidateSimpleBindingWithOptionalGroup('choice', {
          group: reference('Group'),
          simpleBinding: reference('Group.Value'),
          label: reference('Group.Label'),
        }),
      );
      expect(result.current).toEqual(errors);
    },
  );
});
