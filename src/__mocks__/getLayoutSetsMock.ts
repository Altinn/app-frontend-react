import type { ILayoutSets } from 'src/layout/common.generated';

export const defaultDataTypeMock = 'test-data-model';
export function getLayoutSetsMock(): ILayoutSets {
  return {
    sets: [
      {
        id: 'stateless',
        dataType: 'stateless',
        tasks: ['Task_0'],
      },
      {
        id: 'stateless-anon',
        dataType: 'stateless-anon',
        tasks: ['Task_0'],
      },
      {
        id: 'some-data-task',
        dataType: defaultDataTypeMock,
        tasks: ['Task_1'],
      },
    ],
  };
}
