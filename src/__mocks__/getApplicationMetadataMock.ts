import type { ApplicationMetadata } from 'src/features/applicationMetadata/types';

export const getApplicationMetadataMock = (
  overrides: Partial<ApplicationMetadata> | ((application: ApplicationMetadata) => void) = {},
): ApplicationMetadata => {
  const out: ApplicationMetadata = {
    id: 'mockOrg/test-app',
    org: 'mockOrg',
    title: {
      nb: 'Test App',
    },
    autoDeleteOnProcessEnd: false,
    isValidVersion: true,
    dataTypes: [
      {
        id: 'test-data-model',
        allowedContentTypes: ['application/xml'],
        appLogic: {
          autoCreate: true,
          classRef: 'Altinn.App.Models.Skjema',
        },
        taskId: 'Task_1',
        maxCount: 1,
        minCount: 1,
      },
      {
        id: 'ref-data-as-pdf',
        allowedContentTypes: ['application/pdf'],
        maxCount: 0,
        minCount: 0,
      },
      {
        id: 'test-data-type-1',
        allowedContentTypes: ['application/pdf'],
        maxCount: 5,
        minCount: 0,
      },
      {
        id: 'test-data-type-2',
        allowedContentTypes: ['application/pdf'],
        maxCount: 2,
        minCount: 0,
      },
      {
        id: 'stateless',
        allowedContentTypes: ['application/xml'],
        appLogic: {
          autoCreate: true,
          classRef: 'Altinn.App.Models.Skjema2',
        },
        taskId: 'Task_0',
        maxCount: 1,
        minCount: 1,
      },
      {
        id: 'stateless-anon',
        allowedContentTypes: ['application/xml'],
        appLogic: {
          autoCreate: true,
          classRef: 'Altinn.App.Models.Skjema3',
          allowAnonymousOnStateless: true,
        },
        taskId: 'Task_0',
        maxCount: 1,
        minCount: 1,
      },
    ],
    partyTypesAllowed: {
      bankruptcyEstate: false,
      organisation: false,
      person: true,
      subUnit: false,
    },
    onEntry: { show: 'new-instance' },
    isStatelessApp: false,
    ...overrides,
  };

  if (typeof overrides === 'function') {
    overrides(out);
  } else if (overrides && Object.keys(overrides).length > 0) {
    Object.assign(out, overrides);
  }

  return out;
};
