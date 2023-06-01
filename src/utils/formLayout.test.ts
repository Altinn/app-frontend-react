import {
  behavesLikeDataTask,
  findChildren,
  getRepeatingGroups,
  mapFileUploadersWithTag,
  removeRepeatingGroupFromUIConfig,
  topLevelComponents,
} from 'src/utils/formLayout';
import type { IAttachmentState } from 'src/features/attachments';
import type { ILayout } from 'src/layout/layout';
import type { ILayoutSets, IRepeatingGroups } from 'src/types';

const testLayout: ILayout = [
  {
    id: 'Group1',
    type: 'Group',
    dataModelBindings: {
      group: 'Group1',
    },
    children: ['field1', 'Group2'],
    maxCount: 3,
  },
  {
    id: 'Group2',
    type: 'Group',
    dataModelBindings: {
      group: 'Group1.Group2',
    },
    maxCount: 4,
    children: ['field2'],
  },
  {
    id: 'field1',
    type: 'Input',
    dataModelBindings: {
      simple: 'Group1.prop1',
    },
    textResourceBindings: {
      title: 'Title',
    },
    readOnly: false,
    required: false,
  },
  {
    id: 'field2',
    type: 'Input',
    dataModelBindings: {
      simple: 'Group1.Group2.prop1',
    },
    textResourceBindings: {
      title: 'Title',
    },
    readOnly: false,
    required: false,
  },
];

describe('getRepeatingGroups', () => {
  it('should handle nested groups', () => {
    const formData = {
      'Group1[0].prop1': 'value-0-1',
      'Group1[0].Group2[0].group2prop': 'group2-0-0-value',
      'Group1[1].prop1': 'value-1-1',
      'Group1[1].Group2[0].group2prop': 'group2-1-0-value',
      'Group1[1].Group2[1].group2prop': 'group2-1-1-value',
      'Group1[1].Group2[2].group2prop': 'group2-1-2-value',
      'Group1[1].Group2[3].group2prop': 'group2-1-3-value',
      'Group1[1].Group2[4].group2prop': 'group2-1-3-value',
      'Group1[2].prop1': 'value-2-1',
      'Group1[2].Group2[0].group2prop': 'group2-2-1-value',
      'Group1[2].Group2[1].group2prop': 'group2-2-2-value',
    };
    const expected = {
      Group1: {
        index: 2,
        dataModelBinding: 'Group1',
        editIndex: -1,
        multiPageIndex: -1,
      },
      'Group2-0': {
        index: 0,
        baseGroupId: 'Group2',
        dataModelBinding: 'Group1.Group2',
        editIndex: -1,
        multiPageIndex: -1,
      },
      'Group2-1': {
        index: 4,
        baseGroupId: 'Group2',
        dataModelBinding: 'Group1.Group2',
        editIndex: -1,
        multiPageIndex: -1,
      },
      'Group2-2': {
        index: 1,
        baseGroupId: 'Group2',
        dataModelBinding: 'Group1.Group2',
        editIndex: -1,
        multiPageIndex: -1,
      },
    };
    const result = getRepeatingGroups(testLayout, formData);
    expect(result).toEqual(expected);
  });

  it('should handle nested groups with index above 9', () => {
    const formData = {
      'Group1[0].prop1': 'value-0-1',
      'Group1[0].Group2[0].group2prop': 'group2-0-0-value',
      'Group1[1].prop1': 'value-1-1',
      'Group1[1].Group2[0].group2prop': 'group2-1-0-value',
      'Group1[1].Group2[1].group2prop': 'group2-1-1-value',
      'Group1[1].Group2[2].group2prop': 'group2-1-2-value',
      'Group1[1].Group2[3].group2prop': 'group2-1-3-value',
      'Group1[1].Group2[4].group2prop': 'group2-1-3-value',
      'Group1[1].Group2[5].group2prop': 'group2-1-3-value',
      'Group1[1].Group2[6].group2prop': 'group2-1-3-value',
      'Group1[1].Group2[7].group2prop': 'group2-1-3-value',
      'Group1[1].Group2[8].group2prop': 'group2-1-3-value',
      'Group1[1].Group2[9].group2prop': 'group2-1-3-value',
      'Group1[1].Group2[10].group2prop': 'group2-1-3-value',
      'Group1[2].prop1': 'value-2-1',
      'Group1[2].Group2[0].group2prop': 'group2-2-1-value',
      'Group1[2].Group2[1].group2prop': 'group2-2-2-value',
    };
    const expected = {
      Group1: {
        index: 2,
        dataModelBinding: 'Group1',
        editIndex: -1,
        multiPageIndex: -1,
      },
      'Group2-0': {
        index: 0,
        baseGroupId: 'Group2',
        dataModelBinding: 'Group1.Group2',
        editIndex: -1,
        multiPageIndex: -1,
      },
      'Group2-1': {
        index: 10,
        baseGroupId: 'Group2',
        dataModelBinding: 'Group1.Group2',
        editIndex: -1,
        multiPageIndex: -1,
      },
      'Group2-2': {
        index: 1,
        baseGroupId: 'Group2',
        dataModelBinding: 'Group1.Group2',
        editIndex: -1,
        multiPageIndex: -1,
      },
    };

    const result = getRepeatingGroups(testLayout, formData);
    expect(result).toEqual(expected);
  });

  it('should correctly handle out-of-order formData', () => {
    const formData = {
      'Group1[2].prop1': 'value-2-1',
      'Group1[2].Group2[1].group2prop': 'group2-2-2-value',
      'Group1[2].Group2[0].group2prop': 'group2-2-1-value',
      'Group1[1].prop1': 'value-1-1',
      'Group1[1].Group2[3].group2prop': 'group2-1-3-value',
      'Group1[1].Group2[4].group2prop': 'group2-1-3-value',
      'Group1[1].Group2[0].group2prop': 'group2-1-0-value',
      'Group1[1].Group2[1].group2prop': 'group2-1-1-value',
      'Group1[1].Group2[2].group2prop': 'group2-1-2-value',
      'Group1[0].Group2[0].group2prop': 'group2-0-0-value',
      'Group1[0].prop1': 'value-0-1',
    };
    const expected = {
      Group1: {
        index: 2,
        dataModelBinding: 'Group1',
        editIndex: -1,
        multiPageIndex: -1,
      },
      'Group2-0': {
        index: 0,
        baseGroupId: 'Group2',
        dataModelBinding: 'Group1.Group2',
        editIndex: -1,
        multiPageIndex: -1,
      },
      'Group2-1': {
        index: 4,
        baseGroupId: 'Group2',
        dataModelBinding: 'Group1.Group2',
        editIndex: -1,
        multiPageIndex: -1,
      },
      'Group2-2': {
        index: 1,
        baseGroupId: 'Group2',
        dataModelBinding: 'Group1.Group2',
        editIndex: -1,
        multiPageIndex: -1,
      },
    };
    const result = getRepeatingGroups(testLayout, formData);
    expect(result).toEqual(expected);
  });

  it('should return correct count', () => {
    const testLayout: ILayout = [
      {
        id: 'Group1',
        type: 'Group',
        dataModelBindings: {
          group: 'Group1',
        },
        children: ['field1'],
        maxCount: 3,
      },
      {
        id: 'Group2',
        type: 'Group',
        dataModelBindings: {
          group: 'Group2',
        },
        children: ['field2'],
        maxCount: 3,
      },
      {
        id: 'field1',
        type: 'Input',
        dataModelBindings: {
          simple: 'Group.prop1',
        },
        textResourceBindings: {
          title: 'Title',
        },
        readOnly: false,
        required: false,
      },
      {
        id: 'field2',
        type: 'Input',
        dataModelBindings: {
          simple: 'Group2.prop1',
        },
        textResourceBindings: {
          title: 'Title',
        },
        readOnly: false,
        required: false,
      },
    ];
    const formData = {
      'Group1[0].prop1': 'value-0-1',
      'Group1[1].prop1': 'value-1-1',
      'Group1[2].prop1': 'value-2-1',
      'Group1[3].prop1': 'value-3-1',
      'Group2[0].prop1': 'value-0-1',
      'Group2[1].prop1': 'value-1-1',
      'Group2[2].prop1': 'value-2-1',
    };
    const expected = {
      Group1: {
        index: 3,
        dataModelBinding: 'Group1',
        editIndex: -1,
        multiPageIndex: -1,
      },
      Group2: {
        index: 2,
        dataModelBinding: 'Group2',
        editIndex: -1,
        multiPageIndex: -1,
      },
    };
    const result = getRepeatingGroups(testLayout, formData);
    expect(result).toEqual(expected);
  });
  it('should return correct index from unordered formdata', () => {
    const testLayout: ILayout = [
      {
        id: 'Group1',
        type: 'Group',
        dataModelBindings: {
          group: 'Group1',
        },
        children: ['field1'],
        maxCount: 99,
      },
      {
        id: 'field1',
        type: 'Input',
        textResourceBindings: {
          title: 'Title',
        },
        readOnly: false,
        required: false,
      },
    ];
    const formData = {
      'Group1[0].prop': 'value-0',
      'Group1[1].prop': 'value-1',
      'Group1[12].prop': 'value-1',
      'Group1[2].prop': 'value-2',
      'Group1[3].prop': 'value-3',
      'Group1[4].prop': 'value-0',
      'Group1[5].prop': 'value-1',
      'Group1[6].prop': 'value-2',
      'Group1[7].prop': 'value-3',
      'Group1[8].prop': 'value-3',
      'Group1[9].prop': 'value-3',
    };
    const expected = {
      Group1: {
        index: 12,
        dataModelBinding: 'Group1',
        editIndex: -1,
        multiPageIndex: -1,
      },
    };
    const result = getRepeatingGroups(testLayout, formData);
    expect(result).toEqual(expected);
  });
});

describe('removeRepeatingGroupFromUIConfig', () => {
  it('should delete given index', () => {
    const repeatingGroups: IRepeatingGroups = {
      Group: {
        index: 1,
      },
      'Group2-0': {
        index: 2,
      },
      'Group2-1': {
        index: 3,
      },
    };
    const result = removeRepeatingGroupFromUIConfig(repeatingGroups, 'Group2', 1, false);
    const expected: IRepeatingGroups = {
      Group: {
        index: 1,
      },
      'Group2-0': {
        index: 2,
      },
    };
    expect(result).toEqual(expected);
  });

  it('should shift successfully', () => {
    const repeatingGroups: IRepeatingGroups = {
      Group: {
        index: 1,
      },
      'Group2-0': {
        index: 2,
      },
      'Group2-1': {
        index: 3,
      },
    };
    const result = removeRepeatingGroupFromUIConfig(repeatingGroups, 'Group2', 0, true);
    const expected: IRepeatingGroups = {
      Group: {
        index: 1,
      },
      'Group2-0': {
        index: 3,
      },
    };
    expect(result).toEqual(expected);
  });
});

describe('mapFileUploadersWithTag', () => {
  it('should return expected uiConfig', () => {
    const testLayout: ILayout = [
      {
        id: 'file-upload-with-tag1',
        type: 'FileUploadWithTag',
        textResourceBindings: {
          title: 'VedleggTest',
          description: 'VedleggsTestBeskrivelse',
          tagTitle: 'Datatype',
        },
        dataModelBindings: {},
        maxFileSizeInMB: 25,
        maxNumberOfAttachments: 15,
        minNumberOfAttachments: 1,
        displayMode: 'simple',
        required: true,
        optionsId: 'dataTypes',
        hasCustomFileEndings: true,
        validFileEndings: ['.jpeg', '.jpg', '.pdf'],
      },
      {
        id: 'file-upload-with-tag2',
        type: 'FileUploadWithTag',
        textResourceBindings: {
          title: 'VedleggTest',
          description: 'VedleggsTestBeskrivelse',
          tagTitle: 'Datatype',
        },
        dataModelBindings: {},
        maxFileSizeInMB: 25,
        maxNumberOfAttachments: 15,
        minNumberOfAttachments: 1,
        displayMode: 'simple',
        required: true,
        optionsId: 'dataTypes',
        hasCustomFileEndings: true,
        validFileEndings: ['.jpeg', '.jpg', '.pdf'],
      },
      {
        id: 'file-upload-with-tag3',
        type: 'FileUploadWithTag',
        textResourceBindings: {
          title: 'VedleggTest',
          description: 'VedleggsTestBeskrivelse',
          tagTitle: 'Datatype',
        },
        dataModelBindings: {},
        maxFileSizeInMB: 25,
        maxNumberOfAttachments: 15,
        minNumberOfAttachments: 1,
        displayMode: 'simple',
        required: true,
        optionsId: 'dataTypes',
        hasCustomFileEndings: true,
        validFileEndings: ['.jpeg', '.jpg', '.pdf'],
      },
    ];

    const testAttachments: IAttachmentState = {
      attachments: {
        'file-upload-with-tag1': [
          {
            name: 'test-1.pdf',
            size: 18302,
            uploaded: true,
            tags: ['TAG-1'],
            id: 'id-1',
            deleting: false,
            updating: false,
          },
          {
            name: 'test-2.pdf',
            size: 22165,
            uploaded: true,
            tags: ['TAG-2'],
            id: 'id-2',
            deleting: false,
            updating: false,
          },
        ],
        'file-upload-with-tag2': [
          {
            name: 'test-3.pdf',
            size: 18302,
            uploaded: true,
            tags: ['TAG-3'],
            id: 'id-3',
            deleting: false,
            updating: false,
          },
          {
            name: 'test-4.pdf',
            size: 22165,
            uploaded: true,
            tags: ['TAG-4'],
            id: 'id-4',
            deleting: false,
            updating: false,
          },
        ],
      },
    };
    const expected = {
      'file-upload-with-tag1': {
        editIndex: -1,
        chosenOptions: {
          'id-1': 'TAG-1',
          'id-2': 'TAG-2',
        },
      },
      'file-upload-with-tag2': {
        editIndex: -1,
        chosenOptions: {
          'id-3': 'TAG-3',
          'id-4': 'TAG-4',
        },
      },
    };
    const result = mapFileUploadersWithTag(testLayout, testAttachments);
    expect(result).toEqual(expected);
  });
});

describe('findChildren', () => {
  it('should work with simple layouts', () => {
    const result1 = findChildren(testLayout);
    expect(result1).toHaveLength(2);

    const result2 = findChildren(testLayout, { rootGroupId: 'Group2' });
    expect(result2).toHaveLength(1);
    expect(result2[0].id).toEqual('field2');

    const result3 = findChildren(testLayout, {
      matching: (c) => c.id === 'field1',
    });
    expect(result3).toHaveLength(1);
    expect(result3[0].id).toEqual('field1');

    const result4 = findChildren(testLayout, {
      matching: (c) => c.id === 'field1',
      rootGroupId: 'Group2',
    });
    expect(result4).toHaveLength(0);
  });

  it('should work with multi-page groups', () => {
    const layout: ILayout = [
      {
        id: 'field1',
        type: 'Input',
      },
      {
        id: 'group1',
        type: 'Group',
        children: ['0:field2', '1:field3'],
        edit: { multiPage: true },
      },
      {
        id: 'field2',
        required: true,
        type: 'Input',
      },
      {
        id: 'field3',
        required: false,
        type: 'Input',
      },
    ];

    const result1 = findChildren(layout, {
      matching: (c) => c.required === true,
      rootGroupId: 'group1',
    });

    expect(result1).toHaveLength(1);
    expect(result1[0].id).toEqual('field2');

    const result2 = findChildren(layout, {
      rootGroupId: 'group1',
    });

    expect(result2).toHaveLength(2);
    expect(result2.map((c) => c.id)).toEqual(['field2', 'field3']);
  });

  it('should work with nested groups out-of-order', () => {
    const layout: ILayout = [
      {
        id: 'field1',
        type: 'Input',
      },
      {
        id: 'group0',
        type: 'Group',
        children: ['field4'],
        maxCount: 3,
      },
      {
        id: 'group1',
        type: 'Group',
        children: ['field2', 'field3', 'group0'],
        maxCount: 3,
      },
      {
        id: 'field2',
        required: true,
        type: 'Input',
      },
      {
        id: 'field3',
        required: false,
        type: 'Input',
      },
      {
        id: 'field4',
        required: true,
        type: 'Input',
      },
    ];

    const result1 = findChildren(layout, {
      matching: (c) => c.required === true,
    });

    expect(result1).toHaveLength(2);
    expect(result1.map((c) => c.id)).toEqual(['field2', 'field4']);

    const result2 = findChildren(layout, {
      rootGroupId: 'group1',
    });

    expect(result2).toHaveLength(3);
    expect(result2.map((c) => c.id)).toEqual(['field2', 'field3', 'field4']);
  });
});

function onlyIds(layout: ILayout): string[] {
  return layout.map((c) => c.id);
}

describe('topLevelComponents', () => {
  it('should only return the test layout group', () => {
    const output = topLevelComponents(testLayout);
    expect(onlyIds(output)).toEqual(['Group1']);
  });
  it('should also include a free-standing top level component', () => {
    const output = topLevelComponents([
      ...testLayout,
      {
        id: 'freeStanding',
        type: 'Button',
      },
    ]);
    expect(onlyIds(output)).toEqual(['Group1', 'freeStanding']);
  });
});

describe('behavesLikeDataTask', () => {
  const layoutSets: ILayoutSets = {
    sets: [
      { id: 'set_1', dataType: 'SomeType', tasks: ['Task_1'] },
      { id: 'set_2', dataType: 'SomeType', tasks: ['Task_2'] },
    ],
  };
  it('should return true if a given task has configured a layout set', () => {
    const task = 'Task_1';
    const result = behavesLikeDataTask(task, layoutSets);
    expect(result).toBe(true);
  });

  it('should return false if a given task is not configured as a layout set', () => {
    const task = 'Task_3';
    const result = behavesLikeDataTask(task, layoutSets);
    expect(result).toBe(false);
  });
});
