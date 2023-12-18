import type { CompGroupRepeatingExternal } from 'src/layout/RepeatingGroup/config.generated';

export function getFormLayoutRepeatingGroupMock(
  customMock?: Partial<CompGroupRepeatingExternal>,
  children?: string[],
): CompGroupRepeatingExternal {
  const mockLayoutGroup = {
    id: 'container-closed-id',
    type: 'RepeatingGroup',
    children: children || ['field1', 'field2', 'field3', 'field4'],
    maxCount: 8,
    dataModelBindings: {
      group: 'some-group',
    },
  } as CompGroupRepeatingExternal;
  return {
    ...mockLayoutGroup,
    ...customMock,
  };
}
