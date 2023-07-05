import type { ValidLanguageKey } from 'src/hooks/useLanguage';

export type IValidationTextMap = {
  [source: string]:
    | undefined
    | {
        [code: string]: ValidLanguageKey | undefined;
      };
};

/**
 * This maps source and code from IValidationIssue objects from the backend into language keys
 * used for standard validation messages from the backend.
 * @see mapValidationIssues
 */
export const validationTexts: IValidationTextMap = {
  File: {
    ContentTypeNotAllowed: 'altinn.standard_validation.file_content_type_not_allowed',
  },
};
