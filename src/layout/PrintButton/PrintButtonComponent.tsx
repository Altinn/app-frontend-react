import React from 'react';

import { Button, ButtonColor, ButtonVariant } from '@digdir/design-system-react';

import type { PropsFromGenericComponent } from '..';

import { useAppSelector } from 'src/hooks/useAppSelector';
import { getLanguageFromKey } from 'src/language/sharedLanguage';

export const PrintButtonComponent = (props: PropsFromGenericComponent<'PrintButton'>) => {
  const language = useAppSelector((state) => state.language.language);

  if (!language) {
    return null;
  }

  const text = props.text ?? getLanguageFromKey('general.print_button_text', language);

  return (
    <Button
      variant={ButtonVariant.Outline}
      color={ButtonColor.Primary}
      onClick={window.print}
    >
      {text}
    </Button>
  );
};
