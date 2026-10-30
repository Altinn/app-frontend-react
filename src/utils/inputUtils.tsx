import type { FieldCounterProps } from '@digdir/designsystemet-react';

import { useLanguage } from 'src/features/language/useLanguage';

/**
 * Hook to create a character limit object for use in input components
 */
export const useCharacterLimit = (maxLength: number | undefined): FieldCounterProps | undefined => {
  const { langAsString } = useLanguage();

  if (maxLength === undefined) {
    return undefined;
  }

  return {
    limit: maxLength,
    under: langAsString('input_components.remaining_characters'),
    over: langAsString('input_components.exceeded_max_limit'),
  };
};

type ShouldTrimWhitespaceOnBlurArgs = {
  trimWhitespace?: boolean;
  readOnly?: boolean;
  value: string;
};

/**
 * Whether a text field should remove whitespace at the start and end of its value when it loses focus. Not for
 * read-only fields, and not when the whole window lost focus, since the user may be copying something from another
 * window to paste into the field.
 */
export function shouldTrimWhitespaceOnBlur({
  trimWhitespace,
  readOnly,
  value,
}: ShouldTrimWhitespaceOnBlurArgs): boolean {
  return !!trimWhitespace && !readOnly && document.hasFocus() && value !== value.trim();
}

type BuildAriaDescribedByArgs = {
  renderedInTable?: boolean;
  hasTitle: boolean;
  descriptionId?: string;
  hasDescription: boolean;
  validationsId?: string;
  hasValidations: boolean;
};

export function buildAriaDescribedBy({
  renderedInTable,
  hasTitle,
  descriptionId,
  hasDescription,
  validationsId,
  hasValidations,
}: BuildAriaDescribedByArgs): string | undefined {
  if (renderedInTable === true || !hasTitle) {
    return undefined;
  }

  const ids: string[] = [];

  if (descriptionId && hasDescription) {
    ids.push(descriptionId);
  }

  if (validationsId && hasValidations) {
    ids.push(validationsId);
  }

  return ids.length > 0 ? ids.join(' ') : undefined;
}
