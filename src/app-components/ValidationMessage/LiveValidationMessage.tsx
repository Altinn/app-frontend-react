import React from 'react';
import type { ComponentProps } from 'react';

import { ValidationMessage } from '@digdir/designsystemet-react';

type LiveValidationMessageProps = {
  /** Whether the validation message should be shown. */
  show: boolean;
  /**
   * Id of the live region wrapper. Point an input's `aria-describedby` at this id so the message
   * is announced both when it appears and when the user navigates back to the input.
   */
  id?: string;
  /** Politeness of the live region. Defaults to `polite`. */
  live?: 'polite' | 'assertive';
} & ComponentProps<typeof ValidationMessage>;

/**
 * Renders a {@link ValidationMessage} inside an always-present `aria-live` region. Keeping the
 * region mounted (and toggling only the message inside it) is what allows screen readers to
 * announce the error when it appears — a region inserted at the same time as its content is not
 * reliably announced.
 */
export function LiveValidationMessage({ show, id, live = 'polite', children, ...rest }: LiveValidationMessageProps) {
  return (
    <div
      id={id}
      aria-live={live}
    >
      {show && <ValidationMessage {...rest}>{children}</ValidationMessage>}
    </div>
  );
}
