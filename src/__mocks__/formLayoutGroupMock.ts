import type { CompGroupExternal, CompGroupRepeatingExternal } from 'src/layout/Group/config.generated';

export function getFormLayoutGroupMock<T extends CompGroupExternal>(customMock?: Partial<T>, children?: string[]): T {
  const mockLayoutGroup = {
    id: 'container-closed-id',
    type: 'Group',
    children: children || ['field1', 'field2', 'field3', 'field4'],
    maxCount: 8,
    dataModelBindings: {
      group: 'some-group',
    },
  } as unknown as T;
  return {
    ...mockLayoutGroup,
    ...customMock,
  };
}

export function getMultiPageGroupMock(id = 'multipageGroup'): CompGroupRepeatingExternal {
  return {
    type: 'Group',
    id,
    dataModelBindings: {
      group: 'multipageGroup',
    },
    maxCount: 2,
    edit: {
      multiPage: true,
    },
    children: ['FormLayout:field1', 'FormLayout:field2', 'FormLayout:field3'],
  };
}
