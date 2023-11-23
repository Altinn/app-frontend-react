import { getApplicationMetadataMock } from 'src/__mocks__/getApplicationMetadataMock';
import { getApplicationSettingsMock } from 'src/__mocks__/getApplicationSettingsMock';
import { getFormDataStateMock } from 'src/__mocks__/getFormDataStateMock';
import { getFormLayoutStateMock } from 'src/__mocks__/getFormLayoutStateMock';
import { getInstanceDataMock } from 'src/__mocks__/getInstanceDataMock';
import { getOrgsMock } from 'src/__mocks__/getOrgsMock';
import { getProcessDataMock } from 'src/__mocks__/getProcessDataMock';
import { getProfileStateMock } from 'src/__mocks__/getProfileMock';
import { DevToolsTab } from 'src/features/devtools/data/types';
import type { IRuntimeState } from 'src/types';

export function getInitialStateMock(custom?: Partial<IRuntimeState> | ((state: IRuntimeState) => void)): IRuntimeState {
  const initialState: IRuntimeState = {
    applicationMetadata: {
      applicationMetadata: getApplicationMetadataMock(),
    },
    customValidation: {
      customValidation: null,
    },
    devTools: {
      activeTab: DevToolsTab.General,
      isOpen: false,
      pdfPreview: false,
      hiddenComponents: 'hide',
      layoutInspector: {
        selectedComponentId: undefined,
      },
      nodeInspector: {
        selectedNodeId: undefined,
      },
      exprPlayground: {
        expression: undefined,
        forPage: undefined,
        forComponentId: undefined,
      },
      logs: [],
    },
    formData: getFormDataStateMock(),
    formDataModel: {
      schemas: {},
    },
    formDynamics: {
      APIs: null,
      conditionalRendering: null,
      ruleConnection: null,
    },
    formLayout: getFormLayoutStateMock(),
    formRules: {
      model: [],
    },
    formValidations: {
      validations: {},
      invalidDataTypes: [],
    },
    footerLayout: {
      footerLayout: null,
    },
    organisationMetaData: {
      allOrgs: getOrgsMock(),
      error: null,
    },
    profile: getProfileStateMock(),
    textResources: {
      resourceMap: {
        'option.from.rep.group.label': {
          value: 'The value from the group is: {0}',
          variables: [
            {
              dataSource: 'dataModel.skjema',
              key: 'someGroup[{0}].labelField',
            },
          ],
        },
        'option.from.rep.group.description': {
          value: 'Description: The value from the group is: {0}',
          variables: [
            {
              dataSource: 'dataModel.skjema',
              key: 'someGroup[{0}].labelField',
            },
          ],
        },
        'option.from.rep.group.helpText': {
          value: 'Help Text: The value from the group is: {0}',
          variables: [
            {
              dataSource: 'dataModel.skjema',
              key: 'someGroup[{0}].labelField',
            },
          ],
        },
        'group.input.title': {
          value: 'The value from group is: {0}',
          variables: [
            {
              dataSource: 'dataModel.skjema',
              key: 'referencedGroup[{0}].inputField',
            },
          ],
        },
        'group.input.title-2': {
          value: 'The value from the group is: Value from input field [2]',
          variables: [
            {
              dataSource: 'dataModel.skjema',
              key: 'referencedGroup[2].inputField',
            },
          ],
        },
        'accordion.title': {
          value: 'This is a title',
        },
      },
      language: 'nb',
    },
    applicationSettings: {
      applicationSettings: getApplicationSettingsMock(),
    },
    deprecated: {
      lastKnownProcess: getProcessDataMock(),
      lastKnownInstance: getInstanceDataMock(),
      currentLanguage: 'nb',
    },
  };

  if (custom && typeof custom === 'function') {
    custom(initialState);
    return initialState;
  }

  return {
    ...initialState,
    ...custom,
  };
}
