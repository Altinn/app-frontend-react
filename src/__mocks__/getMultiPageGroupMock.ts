import type { CompRepeatingGroupExternal } from 'src/layout/RepeatingGroup/config.generated';

export function getMultiPageGroupMock(id = 'multipageGroup'): CompRepeatingGroupExternal {
  return {
    type: 'RepeatingGroup',
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
