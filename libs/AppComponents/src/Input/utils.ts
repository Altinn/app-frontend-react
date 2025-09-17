import type { FieldCounterProps } from '@digdir/designsystemet-react';

/**
 * Create a character limit object for use in input components
 * This is a simplified version that doesn't depend on the language system
 */
export const createCharacterLimit = (maxLength: number | undefined): FieldCounterProps | undefined => {
  if (maxLength === undefined) {
    return undefined;
  }

  return {
    limit: maxLength,
    under: 'characters remaining',
    over: 'character limit exceeded',
  };
};