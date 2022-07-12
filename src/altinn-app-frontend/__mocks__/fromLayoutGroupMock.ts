import type { ILayoutGroup } from 'src/features/form/layout';

export function getFromLayoutGroupMock(
  customMock?: Partial<ILayoutGroup>,
  children?: string[],
): ILayoutGroup {
  const mockLayoutGroup: ILayoutGroup = {
    id: 'referencedGroup',
    type: 'Group',
    dataModelBindings: {
      group: 'referencedGroup',
    },
    children: children || ['referenced-group-child'],
  };

  return {
    ...mockLayoutGroup,
    ...customMock,
  };
}
