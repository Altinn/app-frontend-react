import type { ErrorObject } from 'ajv';

import { resourcesAsMap } from 'src/features/textResources/resourcesAsMap';
import { staticUseLanguageForTests } from 'src/hooks/useLanguage';
import { isOneOfError } from 'src/utils/validation/schemaValidation';
import { missingFieldsInLayoutValidations } from 'src/utils/validation/validation';
import type { TextResourceMap } from 'src/features/textResources';
import type { IUseLanguage } from 'src/hooks/useLanguage';
import type { ILayoutValidations } from 'src/utils/validation/types';

// Mock dateformat
jest.mock('src/utils/dateHelpers', () => ({
  __esModules: true,
  ...jest.requireActual('src/utils/dateHelpers'),
  getDateFormat: jest.fn(() => 'DD.MM.YYYY'),
}));

describe('utils > validation', () => {
  let mockLanguage: any;
  let mockTextResources: TextResourceMap;
  let mockLangTools: IUseLanguage;

  beforeEach(() => {
    mockLanguage = {
      language: {
        form_filler: {
          error_required: 'Du må fylle ut {0}',
          file_uploader_validation_error_file_number_1: 'For å fortsette må du laste opp',
          file_uploader_validation_error_file_number_2: 'vedlegg',
          address: 'Gateadresse',
          postPlace: 'Poststed',
          zipCode: 'Postnummer',
        },
        validation: {
          generic_field: 'dette feltet',
        },
        validation_errors: {
          minLength: 'length must be bigger than {0}',
          min: 'must be bigger than {0}',
          pattern: 'Feil format eller verdi',
          minItems: 'Du må legge til minst {0} rader',
        },
        date_picker: {
          invalid_date_message: 'Invalid date format. Use the format {0}.',
          min_date_exeeded: 'Date should not be before minimal date',
          max_date_exeeded: 'Date should not be after maximal date',
        },
      },
    };

    mockTextResources = resourcesAsMap([
      {
        id: 'c1Title',
        value: 'component_1',
      },
      {
        id: 'c2Title',
        value: 'component_2',
      },
      {
        id: 'c3Title',
        value: 'component_3',
      },
      {
        id: 'c4Title',
        value: 'component_4',
      },
      {
        id: 'c4RequiredValidation',
        value: 'Component_4 feltet er påkrevd og må besvares',
      },
      {
        id: 'c5Title',
        value: 'component_5',
      },
      {
        id: 'c6Title',
        value: 'component_6',
      },
      {
        id: 'withGroupVariables',
        value: '{0}',
        variables: [
          {
            key: 'group_1[{0}].dataModelField_4',
            dataSource: 'dataModel.default',
          },
        ],
      },
      {
        id: 'custom_error',
        value: 'This is a custom error message',
      },
    ]);

    mockLangTools = staticUseLanguageForTests({ textResources: mockTextResources, language: mockLanguage.language });

    /**
     * Silences deprecation warning about jsPropertySyntax from Ajv, so we don't pollute our test runner output with
     * these warnings. We already know about the deprecation of jsPropertySyntax, and our tests will fail if/when
     * AJV decides to completely remove support for this syntax.
     *
     * @see createValidator
     */
    const oldConsoleWarn = console.warn;
    console.warn = (...args: any[]) => {
      if (typeof args[0] === 'string' && args[0].match(/DEPRECATED: option jsPropertySyntax/)) {
        return;
      }

      oldConsoleWarn(...args);
    };
  });

  describe('isOneOfError', () => {
    it('should return fasle if provided error does not have keyword `oneOf`', () => {
      const error: ErrorObject = {
        keyword: 'test',
        instancePath: '',
        schemaPath: '',
        params: {},
      };
      const result = isOneOfError(error);
      expect(result).toBeFalsy();
    });
    it('should return true if provided error has keyword `oneOf`', () => {
      const error: ErrorObject = {
        keyword: 'oneOf',
        instancePath: '',
        schemaPath: '',
        params: {},
      };
      const result = isOneOfError(error);
      expect(result).toBeTruthy();
    });

    it('should return true if provided error has param "type: null"', () => {
      const error: ErrorObject = {
        keyword: 'test',
        instancePath: '',
        schemaPath: '',
        params: {
          type: 'null',
        },
      };
      const result = isOneOfError(error);
      expect(result).toBeTruthy();
    });
  });

  describe('missingFieldsInLayoutValidations', () => {
    it('should return false when validations contain no messages for missing fields', () => {
      const validations: ILayoutValidations = {
        field: {
          simple_binding: {
            errors: ['Some random error'],
            warnings: [],
          },
        },
      };
      const result = missingFieldsInLayoutValidations(validations, [], mockLangTools);
      expect(result).toBeFalsy();
    });
    it('should return true when validations contain messages (string) for missing fields', () => {
      const validations: ILayoutValidations = {
        field: {
          simple_binding: {
            errors: ['Some random error', 'Du må fylle ut dette feltet'],
            warnings: [],
          },
        },
      };
      const result = missingFieldsInLayoutValidations(validations, [], mockLangTools);
      expect(result).toBeTruthy();
    });
    it('should return true when validations contain arrays with error message for missing fields', () => {
      const validations = (err: string): ILayoutValidations => ({
        field: {
          simple_binding: {
            errors: ['Some random error', err],
            warnings: [],
          },
        },
      });
      const shallow = 'Første linje\nDu må fylle ut ';
      const deep = 'Dette er feil:\nFørste linje\nDu må fylle ut ';
      expect(missingFieldsInLayoutValidations(validations(shallow), [], mockLangTools)).toBeTruthy();
      expect(missingFieldsInLayoutValidations(validations(deep), [], mockLangTools)).toBeTruthy();
    });
  });
});
