import type React from 'react';

import { useAppSelector } from 'src/common/hooks/useAppSelector';
import { getLanguageFromKey, getParsedLanguageFromText, getTextResourceByKey } from 'src/language/sharedLanguage';
import printStyles from 'src/styles/print.module.css';
import { AsciiUnitSeparator } from 'src/utils/attachment';
import { getOptionLookupKey, getRelevantFormDataForOptionSource, setupSourceOptions } from 'src/utils/options';
import { getTextFromAppOrDefault } from 'src/utils/textResource';
import type { ExprResolved } from 'src/features/expressions/types';
import type { IGridStyling, ISelectionComponent } from 'src/layout/layout';
import type { IPageBreak } from 'src/layout/layout.d';
import type { IAttachment } from 'src/shared/resources/attachments';
import type { IComponentValidations, IOption, ITextResource, ITextResourceBindings } from 'src/types';
import type { ILanguage } from 'src/types/shared';
import type { AnyItem } from 'src/utils/layout/hierarchy.types';

export interface IComponentFormData {
  [binding: string]: string | undefined;
}

export function useOptionList(component: ISelectionComponent): IOption[] {
  const textResources = useAppSelector((state) => state.textResources.resources);
  const formData = useAppSelector((state) => state.formData.formData);
  const repeatingGroups = useAppSelector((state) => state.formLayout.uiConfig.repeatingGroups);
  const options = useAppSelector((state) => state.optionState.options);

  if (component.options) {
    return component.options;
  }
  if (component.optionsId) {
    const key = getOptionLookupKey({
      id: component.optionsId,
      mapping: component.mapping,
    });
    return options[key]?.options || [];
  }
  if (component.source) {
    const relevantTextResource = textResources.find((e) => e.id === component.source?.label);
    const reduxOptions =
      relevantTextResource &&
      setupSourceOptions({
        source: component.source,
        relevantTextResource,
        relevantFormData: getRelevantFormDataForOptionSource(formData, component.source),
        repeatingGroups,
        dataSources: {
          dataModel: formData,
        },
      });
    return reduxOptions || [];
  }

  return [];
}

/**
 * Utility function meant to convert a value for a selection component to a label/text used in Summary
 *
 * Expected to be called from:
 * @see FormComponent.useDisplayData
 */
export function useSelectedValueToText(component: ISelectionComponent, value: string) {
  const textResources = useAppSelector((state) => state.textResources.resources);
  const optionList = useOptionList(component);
  const label = optionList.find((option) => option.value === value)?.label;

  if (!label) {
    return value;
  }

  return getTextResourceByKey(label, textResources) || value;
}

/**
 * Utility function meant to convert multiple values for a multi-selection component to an object used in Summary
 *
 * Expected to be called from:
 * @see FormComponent.useDisplayData
 */
export function useCommaSeparatedOptionsToText(component: ISelectionComponent, value: string) {
  const textResources = useAppSelector((state) => state.textResources.resources);
  const optionList = useOptionList(component);
  const split = value.split(',');
  const out: { [key: string]: string } = {};
  split?.forEach((part) => {
    const textKey = optionList.find((option) => option.value === part)?.label || '';
    out[part] = getTextResourceByKey(textKey, textResources) || part;
  });

  return out;
}

export const getTextResource = (resourceKey: string, textResources: ITextResource[]): React.ReactNode => {
  const textResourceValue = getTextResourceByKey(resourceKey, textResources);
  if (textResourceValue === resourceKey) {
    // No match in text resources
    return resourceKey;
  }
  if (!textResourceValue) {
    return undefined;
  }

  return getParsedLanguageFromText(textResourceValue);
};

export function selectComponentTexts(
  textResources: ITextResource[],
  textResourceBindings: ITextResourceBindings | undefined,
) {
  const result: { [textResourceKey: string]: React.ReactNode } = {};

  if (textResourceBindings) {
    Object.keys(textResourceBindings).forEach((key) => {
      result[key] = getTextResource(textResourceBindings[key], textResources);
    });
  }
  return result;
}

export function getFileUploadComponentValidations(
  validationError: 'upload' | 'update' | 'delete' | null,
  language: ILanguage,
  attachmentId?: string,
): IComponentValidations {
  const componentValidations: any = {
    simpleBinding: {
      errors: [],
      warnings: [],
    },
  };
  if (validationError === 'upload') {
    componentValidations.simpleBinding.errors.push(
      getLanguageFromKey('form_filler.file_uploader_validation_error_upload', language),
    );
  } else if (validationError === 'update') {
    if (attachmentId === undefined || attachmentId === '') {
      componentValidations.simpleBinding.errors.push(
        getLanguageFromKey('form_filler.file_uploader_validation_error_update', language),
      );
    } else {
      componentValidations.simpleBinding.errors.push(
        // If validation has attachmentId, add to start of message and seperate using ASCII Universal Seperator
        attachmentId +
          AsciiUnitSeparator +
          getLanguageFromKey('form_filler.file_uploader_validation_error_update', language),
      );
    }
  } else if (validationError === 'delete') {
    componentValidations.simpleBinding.errors.push(
      getLanguageFromKey('form_filler.file_uploader_validation_error_delete', language),
    );
  }
  return componentValidations;
}

export function getFileUploadWithTagComponentValidations(
  validationMessages: IComponentValidations | undefined,
  validationState: Array<{ id: string; message: string }>,
): Array<{ id: string; message: string }> {
  const result: Array<{ id: string; message: string }> = [];
  validationMessages = validationMessages && JSON.parse(JSON.stringify(validationMessages));

  if (!validationMessages || !validationMessages.simpleBinding) {
    validationMessages = {
      simpleBinding: {
        errors: [],
        warnings: [],
      },
    };
  }
  if (
    validationMessages.simpleBinding !== undefined &&
    validationMessages.simpleBinding.errors &&
    validationMessages.simpleBinding.errors.length > 0
  ) {
    parseFileUploadComponentWithTagValidationObject(validationMessages.simpleBinding.errors as string[]).forEach(
      (validation) => {
        result.push(validation);
      },
    );
  }
  validationState.forEach((validation) => {
    result.push(validation);
  });
  return result;
}

export const parseFileUploadComponentWithTagValidationObject = (
  validationArray: string[],
): Array<{ id: string; message: string }> => {
  if (validationArray === undefined || validationArray.length === 0) {
    return [];
  }
  const obj: Array<{ id: string; message: string }> = [];
  validationArray.forEach((validation) => {
    const val = validation.toString().split(AsciiUnitSeparator);
    if (val.length === 2) {
      obj.push({ id: val[0], message: val[1] });
    } else {
      obj.push({ id: '', message: validation });
    }
  });
  return obj;
};

export const isAttachmentError = (error: { id: string | null; message: string }): boolean => !!error.id;

export const isNotAttachmentError = (error: { id: string | null; message: string }): boolean => {
  return !error.id;
};

export const atleastOneTagExists = (attachments: IAttachment[]): boolean => {
  const totalTagCount: number = attachments
    .map((attachment: IAttachment) => (attachment.tags?.length ? attachment.tags.length : 0))
    .reduce((total, current) => total + current, 0);

  return totalTagCount !== undefined && totalTagCount >= 1;
};

export function getFieldName(
  textResourceBindings: ITextResourceBindings | undefined,
  textResources: ITextResource[],
  language: ILanguage,
  fieldKey?: string,
): string | undefined {
  if (fieldKey) {
    return smartLowerCaseFirst(
      getTextFromAppOrDefault(`form_filler.${fieldKey}`, textResources, language, undefined, true),
    );
  }

  if (textResourceBindings?.shortName) {
    return getTextResourceByKey(textResourceBindings.shortName, textResources);
  }

  if (textResourceBindings?.title) {
    return smartLowerCaseFirst(getTextResourceByKey(textResourceBindings.title, textResources));
  }

  return getLanguageFromKey('validation.generic_field', language);
}

/**
 * Un-uppercase the first letter of a string
 */
export function lowerCaseFirst(text: string, firstLetterIndex = 0): string {
  if (firstLetterIndex > 0) {
    return (
      text.substring(0, firstLetterIndex) + text[firstLetterIndex].toLowerCase() + text.substring(firstLetterIndex + 1)
    );
  }
  return text[firstLetterIndex].toLowerCase() + text.substring(1);
}

/**
 * Un-uppercase the first letter of a string, but be smart about it (avoiding it when the string is an
 * uppercase abbreviation, etc).
 */
export function smartLowerCaseFirst(text: string | undefined): string | undefined {
  if (text === undefined) {
    return undefined;
  }

  const uc = text.toUpperCase();
  const lc = text.toLowerCase();

  let letters = 0;
  let firstLetterIdx = 0;
  for (let i = 0; i < text.length; i++) {
    if (uc[i] === lc[i]) {
      // This is not a letter, or could not be case-converted, skip it
      continue;
    }
    letters++;

    if (letters === 1) {
      if (text[i] === lc[i]) {
        // First letter is lower case already, return early
        return text;
      }

      firstLetterIdx = i;
      continue;
    }

    if (text[i] !== lc[i]) {
      return text;
    }

    if (letters >= 5) {
      // We've seen enough, looks like normal text with an uppercase first letter
      return lowerCaseFirst(text, firstLetterIdx);
    }
  }

  return lowerCaseFirst(text, firstLetterIdx);
}

export const gridBreakpoints = (grid?: IGridStyling) => {
  const { xs, sm, md, lg, xl } = grid || {};
  return {
    xs: xs || 12,
    ...(sm && { sm }),
    ...(md && { md }),
    ...(lg && { lg }),
    ...(xl && { xl }),
  };
};

export const pageBreakStyles = (pageBreak: ExprResolved<IPageBreak> | undefined) => {
  if (!pageBreak) {
    return {};
  }

  return {
    [printStyles['break-before-auto']]: pageBreak.breakBefore === 'auto',
    [printStyles['break-before-always']]: pageBreak.breakBefore === 'always',
    [printStyles['break-before-avoid']]: pageBreak.breakBefore === 'avoid',
    [printStyles['break-after-auto']]: pageBreak.breakAfter === 'auto',
    [printStyles['break-after-always']]: pageBreak.breakAfter === 'always',
    [printStyles['break-after-avoid']]: pageBreak.breakAfter === 'avoid',
  };
};

export function getTextAlignment(component: AnyItem): 'left' | 'center' | 'right' {
  if (component.type !== 'Input') {
    return 'left';
  }
  const formatting = component.formatting;
  if (formatting && formatting.align) {
    return formatting.align;
  }
  if (formatting && formatting.number) {
    return 'right';
  }
  return 'left';
}
