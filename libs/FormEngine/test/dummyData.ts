/**
 * Dummy data for testing FormEngine
 * This contains the complete data structure provided by the user
 */

import type { FormEngineConfig } from 'libs/FormEngine/types';

export const dummyData: FormEngineConfig = {
  dataModelSchemas: {},
  // Form data
  data: {
    inputfield: null,
    shortAnswerInput: 'Dette må vi ha med in neste instans',
    longAnswerInput: null,
    radioButtonInput: null,
    checkboxesInput: null,
    nestedInput: null,
    nestedInput2: null,
    nestedInput3: null,
    streetnr: null,
    postnr: null,
    city: null,
    co: null,
    street: null,
    GridExample: null,
    dropdown: null,
    multipleSelect: null,
    repeatingGroup: [],
    nestedRepeatingGroup: [],
    list: null,
    LikertExample: [
      {
        Id: 'question-1',
        Answer: '',
      },
      {
        Id: 'question-2',
        Answer: '',
      },
      {
        Id: 'question-3',
        Answer: '',
      },
      {
        Id: 'question-4',
        Answer: '',
      },
      {
        Id: 'question-5',
        Answer: '',
      },
      {
        Id: 'question-6',
        Answer: '',
      },
    ],
    DatepickerExample: null,
    mapComponent: null,
    numberPercentage: null,
    anyNumber: null,
    checkboxForCard: null,
    Numbers: null,
    ListGroupExample: [],
    checkboxesPersons: null,
    Dates: null,
    CheckboxesGroupExample: [],
    MultiselectGroupExample: [],
    DatepickerMaxDateExample: null,
    DatepickerMinDateExample: null,
  },

  // Layout sets configuration
  layoutSetsConfig: {
    $schema: 'https://altinncdn.no/toolkits/altinn-app-frontend/4/schemas/json/layout/layout-sets.schema.v1.json',
    sets: [
      {
        id: 'ComponentLayouts',
        dataType: 'model',
        tasks: ['Task_1'],
      },
      {
        id: 'PreviousProcessSummary',
        dataType: 'model2',
        tasks: ['PreviousProcessSummary'],
      },
    ],
    uiSettings: {},
  },

  // Page order
  pageOrder: {
    $schema: 'https://altinncdn.no/schemas/json/layout/layoutSettings.schema.v1.json',
    pages: {
      order: ['RenderPreviousTask', 'RenderSpecificPageFromPreviousTask', 'RenderSpecificComponentFromPreviousTask'],
    },
  },

  // Layouts
  layouts: {
    RenderSpecificComponentFromPreviousTask: {
      $schema: 'https://altinncdn.no/schemas/json/layout/layout.schema.v1.json',
      data: {
        layout: [
          {
            id: 'PrevComponent-NavigationBar',
            type: 'NavigationBar',
          },
          {
            size: 'M',
            id: 'page3Task2',
            type: 'Header',
            textResourceBindings: {
              title: 'Her skal vi rendre hele en enkelt komponent fra Task_1:',
            },
          },
          {
            id: 'Summary2-previous-component',
            type: 'Summary2',
            hidden: false,
            target: {
              type: 'component',
              id: 'AddressPage-Address',
              taskId: 'Task_1',
            },
          },
        ],
      },
    },
    RenderSpecificPageFromPreviousTask: {
      $schema: 'https://altinncdn.no/schemas/json/layout/layout.schema.v1.json',
      data: {
        layout: [
          {
            id: 'PrevPage-NavigationBar',
            type: 'NavigationBar',
          },
          {
            size: 'M',
            id: 'page2Task2',
            type: 'Header',
            textResourceBindings: {
              title: 'Her skal vi rendre en enkelt side fra Task_1:',
            },
          },
          {
            id: 'Summary2-previous-page',
            type: 'Summary2',
            hidden: false,
            target: {
              type: 'page',
              taskId: 'Task_1',
              id: 'AddressPage',
            },
          },
        ],
      },
    },
    RenderPreviousTask: {
      $schema: 'https://altinncdn.no/schemas/json/layout/layout.schema.v1.json',
      data: {
        layout: [
          {
            id: 'PrevTask-NavigationBar',
            type: 'NavigationBar',
          },
          {
            size: 'M',
            id: 'page3summarytask',
            type: 'Header',
            textResourceBindings: {
              title: 'Her skal vi rendre hele Task_1:',
            },
          },
          {
            id: 'Summary2-previous-process',
            type: 'Summary2',
            hidden: false,
            target: {
              taskId: 'Task_1',
              type: 'layoutSet',
            },
            showPageInAccordion: false,
          },
        ],
      },
    },
  },

  // Application metadata
  applicationMetadata: {
    id: 'ttd/component-library',
    org: 'ttd',
    title: {
      nb: 'altinn-apps-all-components',
    },
    dataTypes: [
      {
        id: 'ref-data-as-pdf',
        allowedContentTypes: ['application/pdf'],
        maxCount: 0,
        minCount: 0,
        enablePdfCreation: true,
        enableFileScan: false,
        validationErrorOnPendingFileScan: false,
        enabledFileAnalysers: [],
        enabledFileValidators: [],
      },
      {
        id: 'model',
        allowedContentTypes: ['application/xml'],
        appLogic: {
          autoCreate: true,
          classRef: 'Altinn.App.Models.Model.Model',
          allowAnonymousOnStateless: false,
          autoDeleteOnProcessEnd: false,
          disallowUserCreate: false,
          disallowUserDelete: false,
          allowInSubform: false,
        },
        taskId: 'Task_1',
        maxCount: 1,
        minCount: 1,
        enablePdfCreation: true,
        enableFileScan: false,
        validationErrorOnPendingFileScan: false,
        enabledFileAnalysers: [],
        enabledFileValidators: [],
      },
      {
        id: 'model2',
        allowedContentTypes: ['application/xml'],
        appLogic: {
          autoCreate: true,
          classRef: 'Altinn.App.Models.model2.model2',
          allowAnonymousOnStateless: false,
          autoDeleteOnProcessEnd: false,
          disallowUserCreate: false,
          disallowUserDelete: false,
          allowInSubform: false,
        },
        taskId: 'PreviousProcessSummary',
        maxCount: 1,
        minCount: 1,
        enablePdfCreation: true,
        enableFileScan: false,
        validationErrorOnPendingFileScan: false,
        enabledFileAnalysers: [],
        enabledFileValidators: [],
      },
    ],
    features: {
      footer: true,
      processActions: true,
      jsonObjectInDataResponse: false,
    },
    logo: {
      displayAppOwnerNameInHeader: false,
      source: 'resource',
      size: 'small',
    },
    altinnNugetVersion: '8.0.0.0',
    externalApiIds: ['testId'],
    partyTypesAllowed: {
      bankruptcyEstate: false,
      organisation: false,
      person: false,
      subUnit: false,
    },
    autoDeleteOnProcessEnd: false,
    created: '2024-05-15T08:37:14.2656053Z',
    createdBy: 'adamhaeger',
    lastChanged: '2024-05-15T08:37:14.2656068Z',
    lastChangedBy: 'adamhaeger',
  },

  // Frontend settings (empty in this case)
  frontEndSettings: {},

  // Component configurations (truncated sample - full config would be very large)
  componentConfigs: {
    Input: {
      def: {
        plugins: {
          ValidationPlugin: {
            import: {
              val: {
                import: 'ValidationPlugin',
                from: 'src/features/validation/ValidationPlugin',
              },
            },
          },
        },
        category: 'Form',
        type: 'Input',
        render: {},
      },
      capabilities: {
        renderInTable: true,
        renderInButtonGroup: false,
        renderInAccordion: true,
        renderInAccordionGroup: false,
        renderInCards: true,
        renderInCardsMedia: false,
        renderInTabs: true,
      },
      behaviors: {
        isSummarizable: true,
        canHaveLabel: false,
        canHaveOptions: false,
        canHaveAttachments: false,
      },
    },
    Header: {
      def: {
        plugins: {},
        category: 'Presentation',
        type: 'Header',
        render: {},
      },
      capabilities: {
        renderInTable: true,
        renderInButtonGroup: false,
        renderInAccordion: true,
        renderInAccordionGroup: false,
        renderInCards: true,
        renderInCardsMedia: false,
        renderInTabs: true,
      },
      behaviors: {
        isSummarizable: true,
        canHaveLabel: false,
        canHaveOptions: false,
        canHaveAttachments: false,
      },
    },
    NavigationBar: {
      def: {
        plugins: {},
        category: 'Action',
        type: 'NavigationBar',
        render: {},
      },
      capabilities: {
        renderInTable: false,
        renderInButtonGroup: false,
        renderInAccordion: false,
        renderInAccordionGroup: false,
        renderInCards: false,
        renderInCardsMedia: false,
        renderInTabs: true,
      },
      behaviors: {
        isSummarizable: false,
        canHaveLabel: false,
        canHaveOptions: false,
        canHaveAttachments: false,
      },
    },
    Summary2: {
      def: {
        plugins: {},
        category: 'Presentation',
        type: 'Summary2',
        render: {},
      },
      capabilities: {
        renderInTable: false,
        renderInButtonGroup: false,
        renderInAccordion: false,
        renderInAccordionGroup: false,
        renderInCards: true,
        renderInCardsMedia: false,
        renderInTabs: true,
      },
      behaviors: {
        isSummarizable: false,
        canHaveLabel: false,
        canHaveOptions: false,
        canHaveAttachments: false,
      },
    },
  },

  // User data (simplified)
  user: {
    userId: 1337,
    userName: 'SophieDDG',
    email: '1337@altinnstudiotestusers.com',
    phoneNumber: '90001337',
    partyId: 501337,
    userType: 1,
    profileSettingPreference: {
      language: 'nn',
      preSelectedPartyId: 0,
      doNotPromptForParty: true,
    },
  },

  // Valid parties
  validParties: [
    {
      partyId: 501337,
      partyUuid: 'e9dd7d91-32d8-4933-a108-07562762d572',
      partyTypeName: 1,
      name: 'Sophie Salt',
      isDeleted: false,
      onlyHierarchyElementWithNoAccess: false,
      childParties: [],
    },
    {
      partyId: 500000,
      partyUuid: '77cab4d6-84bb-4eb2-91bd-710415a72d8a',
      partyTypeName: 2,
      orgNumber: '897069650',
      unitType: 'AS',
      name: 'DDG Fitness AS',
      isDeleted: false,
      onlyHierarchyElementWithNoAccess: false,
      childParties: [
        {
          partyId: 500001,
          partyUuid: '5e5d1e4f-810b-4619-9901-093cbf1d8be3',
          partyTypeName: 2,
          orgNumber: '897069651',
          unitType: 'BEDR',
          name: 'DDG Fitness Oslo',
          isDeleted: false,
          onlyHierarchyElementWithNoAccess: false,
          childParties: [],
        },
      ],
    },
  ],
};

/**
 * Simpler test data for basic testing
 */
export const simpleTestData: FormEngineConfig = {
  data: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  },

  dataModelSchemas: {
    model: {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string', format: 'email' },
      },
      required: ['firstName', 'lastName'],
    },
  },

  layoutSetsConfig: {
    sets: [
      {
        id: 'main',
        dataType: 'model',
        tasks: ['form'],
      },
    ],
  },

  pageOrder: {
    pages: {
      order: ['page1'],
    },
  },

  layouts: {
    page1: {
      data: {
        layout: [
          {
            id: 'firstName',
            type: 'Input',
            dataModelBindings: {
              simpleBinding: 'firstName',
            },
            textResourceBindings: {
              title: 'First Name',
            },
            required: true,
          },
          {
            id: 'lastName',
            type: 'Input',
            dataModelBindings: {
              simpleBinding: 'lastName',
            },
            textResourceBindings: {
              title: 'Last Name',
            },
            required: true,
          },
          {
            id: 'email',
            type: 'Input',
            dataModelBindings: {
              simpleBinding: 'email',
            },
            textResourceBindings: {
              title: 'Email',
            },
          },
        ],
      },
    },
  },

  applicationMetadata: {
    id: 'test/simple-form',
    org: 'test',
    title: { nb: 'Simple Test Form' },
    dataTypes: [
      {
        id: 'model',
        allowedContentTypes: ['application/xml'],
        maxCount: 1,
        minCount: 1,
      },
    ],
  },

  frontEndSettings: {},

  componentConfigs: {
    Input: {
      def: {
        category: 'Form',
        type: 'Input',
        render: {},
      },
      capabilities: {
        renderInTable: true,
        renderInButtonGroup: false,
        renderInAccordion: true,
        renderInAccordionGroup: false,
        renderInCards: true,
        renderInCardsMedia: false,
        renderInTabs: true,
      },
      behaviors: {
        isSummarizable: true,
        canHaveLabel: true,
        canHaveOptions: false,
        canHaveAttachments: false,
      },
    },
  },

  user: {
    userId: 1,
    userName: 'testuser',
    partyId: 1,
  },

  validParties: [
    {
      partyId: 1,
      partyUuid: 'test-uuid',
      partyTypeName: 1,
      name: 'Test User',
      isDeleted: false,
    },
  ],
};
