import React from 'react';

import { ErrorMessage } from '@digdir/design-system-react';

import { validationsOfSeverity } from 'src/features/validation/utils';
import { useLanguage } from 'src/hooks/useLanguage';
import { getParsedLanguageFromText } from 'src/language/sharedLanguage';
import { AlertBaseComponent } from 'src/layout/Alert/AlertBaseComponent';
import type { NodeValidation } from 'src/features/validation';
import type { AlertSeverity } from 'src/layout/Alert/config.generated';

// TODO(Validation): Move these components to a more suitable location
export function ComponentValidation({ validations }: { validations: NodeValidation[] | undefined }) {
  if (!validations || validations.length === 0) {
    return null;
  }
  const errors = validationsOfSeverity(validations, 'errors');
  const warnings = validationsOfSeverity(validations, 'warnings');
  const info = validationsOfSeverity(validations, 'info');
  const success = validationsOfSeverity(validations, 'success');

  return (
    <>
      {errors.length > 0 && <ErrorValidations validations={errors} />}
      {warnings.length > 0 && (
        <SoftValidations
          validations={warnings}
          variant='warning'
        />
      )}
      {info.length > 0 && (
        <SoftValidations
          validations={info}
          variant='info'
        />
      )}
      {success.length > 0 && (
        <SoftValidations
          validations={success}
          variant='success'
        />
      )}
    </>
  );
}

function ErrorValidations({ validations }: { validations: NodeValidation<'errors'>[] }) {
  return (
    <div style={{ paddingTop: '0.375rem' }}>
      <ErrorMessage size='small'>
        <ol style={{ padding: 0, margin: 0 }}>
          {validations.map((validation) => (
            <li
              role='alert'
              key={`validationMessage-${validation.message}`}
            >
              {getParsedLanguageFromText(validation.message)}
            </li>
          ))}
        </ol>
      </ErrorMessage>
    </div>
  );
}

function SoftValidations({
  validations,
  variant,
}: {
  validations: NodeValidation<'warnings' | 'info' | 'success'>[];
  variant: AlertSeverity;
}) {
  const { langAsString } = useLanguage();

  /**
   * Rendering the error messages as an ordered
   * list with each error message as a list item.
   */
  const ariaLabel = langAsString(validations.map((v) => v.message).join());

  return (
    <div style={{ paddingTop: 'var(--fds-spacing-2)' }}>
      <AlertBaseComponent
        severity={variant}
        useAsAlert={true}
        ariaLabel={ariaLabel}
      >
        <ol style={{ paddingLeft: 0 }}>
          {validations.map((validation) => (
            <li
              role='alert'
              key={`validationMessage-${validation.message}`}
            >
              {getParsedLanguageFromText(validation.message)}
            </li>
          ))}
        </ol>
      </AlertBaseComponent>
    </div>
  );
}
