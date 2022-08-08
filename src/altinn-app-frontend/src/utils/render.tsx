import * as React from 'react';

import { ErrorMessage } from '@altinn/altinn-design-system';

import { SoftValidations } from 'src/features/form/components/SoftValidations';

export function renderValidationMessagesForComponent(
  validationMessages: any,
  id: string,
): JSX.Element[] {
  if (!validationMessages) {
    return null;
  }
  const validationMessageElements: JSX.Element[] = [];
  if (validationMessages.errors && validationMessages.errors.length > 0) {
    validationMessageElements.push(
      renderValidationMessages(
        validationMessages.errors,
        `error_${id}`,
        'error',
      ),
    );
  }

  if (validationMessages.warnings && validationMessages.warnings.length > 0) {
    validationMessageElements.push(
      renderValidationMessages(
        validationMessages.warnings,
        `warning_${id}`,
        'warning',
      ),
    );
  }

  if (validationMessages.info && validationMessages.info.length > 0) {
    validationMessageElements.push(
      renderValidationMessages(validationMessages.info, `info_${id}`, 'info'),
    );
  }

  if (validationMessages.success && validationMessages.success.length > 0) {
    validationMessageElements.push(
      renderValidationMessages(
        validationMessages.success,
        `success_${id}`,
        'success',
      ),
    );
  }

  return validationMessageElements.length > 0
    ? validationMessageElements
    : null;
}

export function renderValidationMessages(
  messages: React.ReactNode[],
  id: string,
  variant: 'error' | 'warning' | 'info' | 'success',
) {
  if (variant !== 'error') {
    return (
      <SoftValidations variant={variant}>
        <ol id={id}>{messages.map(validationMessagesToList)}</ol>
      </SoftValidations>
    );
  }

  return (
    <ErrorMessage
      id={id}
      key='error'
    >
      <ol>{messages.map(validationMessagesToList)}</ol>
    </ErrorMessage>
  );
}

const validationMessagesToList = (message: React.ReactNode, index: number) => {
  return (
    <li
      role='alert'
      key={`validationMessage-${index}`}
    >
      {message}
    </li>
  );
};
