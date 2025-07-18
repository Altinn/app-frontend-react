import type { ApplicationMetadata } from 'src/features/applicationMetadata/types';

export const getApplicationMetadataMock = (overrides: Partial<ApplicationMetadata> = {}): ApplicationMetadata => ({
  id: 'mockOrg/test-app',
  org: 'mockOrg',
  title: {
    nb: 'Test App',
  },
  autoDeleteOnProcessEnd: false,
  altinnNugetVersion: '8.5.0.141',
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
      maxCount: 1,
      minCount: 1,
    },
    {
      id: 'subform-data',
      allowedContentTypes: ['application/xml'],
      appLogic: {
        classRef: '...',
      },
      taskId: 'Task_1',
      maxCount: 0,
      minCount: 0,
    },
  ],
  partyTypesAllowed: {
    bankruptcyEstate: false,
    organisation: false,
    person: true,
    subUnit: true,
  },
  onEntry: { show: 'new-instance' },
  isValidVersion: true,
  isStatelessApp: false,
  logoOptions: undefined,
  ...overrides,
});
